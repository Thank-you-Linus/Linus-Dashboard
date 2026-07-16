#!/usr/bin/env python3
"""
Fully automated HA first-boot onboarding: create the admin account (or log
into an existing one) and mint a long-lived access token, then write it to
.env as HA_TOKEN — with zero browser interaction.

Why this exists: everything downstream (setup_fake_house_full.py,
scripts/fake-house-watch) already only needs HA_TOKEN in .env to run fully
unattended. The one gap was getting that token in the first place, which
normally means a human opening the browser, clicking through HA's onboarding
wizard, and copy-pasting a token from Profile > Security > Tokens. This
script drives the exact same API the wizard's frontend calls, so the whole
chain — fresh devcontainer to a fully provisioned fake house — becomes one
command with no human in the loop. That matters as much for a developer on a
fresh Mac devcontainer as it does for an AI coding agent with no browser at
all.

Two paths, both idempotent (safe to re-run):
- Fresh instance (onboarding not done): creates the admin account via
  /api/onboarding/users, then completes the remaining onboarding steps
  (core_config, analytics, integration) so the frontend doesn't keep
  prompting for them either.
- Already-onboarded instance with no HA_TOKEN yet: logs in with
  HA_ADMIN_USERNAME/HA_ADMIN_PASSWORD (env vars) via the standard
  /auth/login_flow, same as the HA login page. Not needed on a fresh
  devcontainer — only relevant if onboarding was done by hand at some point
  and .env's HA_TOKEN got lost.

In both cases, the resulting access token is exchanged for a permanent
long-lived access token over the websocket API (auth/long_lived_access_token
has no REST equivalent) and written to .env.

Usage:
    python3 config/bootstrap_ha_onboarding.py
    # or with a custom HA_URL / credentials:
    HA_URL=http://localhost:8123 HA_ADMIN_PASSWORD=... python3 config/bootstrap_ha_onboarding.py

Requires: Python 3 stdlib + `websockets` (already in requirements.txt).
"""

import asyncio
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import websockets

HA_URL = os.environ.get("HA_URL", "http://homeassistant:8123").rstrip("/")
HA_WS_URL = (
    HA_URL.replace("https://", "wss://").replace("http://", "ws://") + "/api/websocket"
)
# HA's own frontend uses the base URL (with trailing slash) as both client_id
# and redirect_uri — indieauth.verify_redirect_uri requires same-origin, so
# reusing HA_URL itself is the simplest value that's always valid.
CLIENT_ID = f"{HA_URL}/"
REDIRECT_URI = f"{HA_URL}/"

ADMIN_NAME = os.environ.get("HA_ADMIN_NAME", "Fake House Admin")
ADMIN_USERNAME = os.environ.get("HA_ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("HA_ADMIN_PASSWORD") or secrets.token_urlsafe(18)
LANGUAGE = os.environ.get("HA_LANGUAGE", "en")
TOKEN_CLIENT_NAME = "fake-house-bootstrap"  # noqa: S105 (a name, not a secret)
ENV_FILE = os.environ.get("ENV_FILE", ".env")
# Separate from .env (which only holds the token): the admin password is
# generated once and shown once, and /tmp/fake-house-watch.log (where the
# devcontainer's background watcher sends this script's output) doesn't
# survive a devcontainer rebuild. Persist it somewhere durable so it isn't
# gone for good the moment the log rotates.
CREDENTIALS_FILE = os.environ.get("CREDENTIALS_FILE", ".ha_admin_credentials")


def api(method, path, body=None, token=None, form=False):
    # HA_URL is developer-controlled (env var / CLI default), never external
    # input, so the http(s)-only scheme here is not attacker-influenced.
    url = f"{HA_URL}{path}"
    if form:
        data = urllib.parse.urlencode(body).encode() if body is not None else None
    else:
        data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)  # noqa: S310
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    req.add_header(
        "Content-Type",
        "application/x-www-form-urlencoded" if form else "application/json",
    )
    try:
        with urllib.request.urlopen(req) as resp:  # noqa: S310
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, raw.decode(errors="replace")


def wait_for_ha():
    print(f"Waiting for HA at {HA_URL}...")
    for _ in range(60):
        status, _ = api("GET", "/api/onboarding")
        if status == 200:
            print("HA is ready\n")
            return
        time.sleep(3)
    print("ERROR: HA never became ready")
    sys.exit(1)


def onboarding_status():
    status, steps = api("GET", "/api/onboarding")
    if status != 200:
        print("FAIL fetching onboarding status:", steps)
        sys.exit(1)
    return {s["step"]: s["done"] for s in steps}


def exchange_auth_code(code):
    status, tokens = api(
        "POST",
        "/auth/token",
        {"grant_type": "authorization_code", "code": code, "client_id": CLIENT_ID},
        form=True,
    )
    if status != 200:
        print("FAIL exchanging auth code for a token:", tokens)
        sys.exit(1)
    return tokens["access_token"]


def onboard_fresh():
    """Create the admin account and complete every remaining onboarding step."""
    print(f"Creating admin user '{ADMIN_USERNAME}'...")
    status, resp = api(
        "POST",
        "/api/onboarding/users",
        {
            "name": ADMIN_NAME,
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD,
            "client_id": CLIENT_ID,
            "language": LANGUAGE,
        },
    )
    if status != 200:
        print("FAIL creating admin user:", resp)
        sys.exit(1)

    access_token = exchange_auth_code(resp["auth_code"])
    print(f"Admin created. Username: {ADMIN_USERNAME}  Password: {ADMIN_PASSWORD}")
    write_credentials_file(ADMIN_USERNAME, ADMIN_PASSWORD)

    for step, path, body in (
        ("core_config", "/api/onboarding/core_config", None),
        ("analytics", "/api/onboarding/analytics", None),
        (
            "integration",
            "/api/onboarding/integration",
            {"client_id": CLIENT_ID, "redirect_uri": REDIRECT_URI},
        ),
    ):
        status, resp = api("POST", path, body, token=access_token)
        if status != 200:
            print(f"FAIL onboarding step {step!r}:", resp)
            sys.exit(1)
        print(f"SKIP (exists): step {step}" if status == 403 else f"DONE: step {step}")

    return access_token


def login_existing():
    """Log into an already-onboarded instance with a username/password."""
    print(f"Instance already onboarded — logging in as '{ADMIN_USERNAME}'...")
    status, flow = api(
        "POST",
        "/auth/login_flow",
        {
            "client_id": CLIENT_ID,
            "handler": ["homeassistant", None],
            "redirect_uri": REDIRECT_URI,
        },
    )
    if status != 200:
        print("FAIL starting login flow:", flow)
        sys.exit(1)

    status, result = api(
        "POST",
        f"/auth/login_flow/{flow['flow_id']}",
        {
            "client_id": CLIENT_ID,
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD,
        },
    )
    if status != 200 or result.get("type") != "create_entry":
        print(
            "FAIL logging in — set HA_ADMIN_USERNAME/HA_ADMIN_PASSWORD env vars to "
            "match an existing admin account, or create a long-lived token by hand "
            "in the UI (Profile > Security > Tokens) and put it in .env as HA_TOKEN.",
        )
        print("Login response:", result)
        sys.exit(1)

    return exchange_auth_code(result["result"])


async def create_long_lived_token(access_token):
    async with websockets.connect(HA_WS_URL) as ws:
        await ws.recv()  # auth_required
        await ws.send(json.dumps({"type": "auth", "access_token": access_token}))
        auth_result = json.loads(await ws.recv())
        if auth_result["type"] != "auth_ok":
            print("FAIL websocket auth:", auth_result)
            sys.exit(1)

        await ws.send(
            json.dumps({
                "id": 1,
                "type": "auth/long_lived_access_token",
                "client_name": TOKEN_CLIENT_NAME,
                "lifespan": 3650,
            })
        )
        resp = json.loads(await ws.recv())
        if not resp.get("success"):
            print("FAIL creating long-lived access token:", resp)
            sys.exit(1)
        return resp["result"]


def write_env_token(token):
    lines = []
    env_path = Path(ENV_FILE)
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines(keepends=True)

    replaced = False
    for i, line in enumerate(lines):
        if line.startswith("HA_TOKEN="):
            lines[i] = f"HA_TOKEN={token}\n"
            replaced = True
            break
    if not replaced:
        if lines and not lines[-1].endswith("\n"):
            lines[-1] += "\n"
        lines.append(f"HA_TOKEN={token}\n")

    env_path.write_text("".join(lines), encoding="utf-8")
    print(f"HA_TOKEN written to {ENV_FILE}")


def write_credentials_file(username, password):
    Path(CREDENTIALS_FILE).write_text(
        "# Auto-generated by config/bootstrap_ha_onboarding.py — only needed if\n"
        "# you want to log into the HA web UI directly (HA_TOKEN in .env is what\n"
        "# everything else uses). Not regenerated on later runs.\n"
        f"HA_ADMIN_USERNAME={username}\n"
        f"HA_ADMIN_PASSWORD={password}\n",
        encoding="utf-8",
    )
    print(f"Admin credentials also saved to {CREDENTIALS_FILE} (gitignored)")


def existing_token_still_works():
    env_path = Path(ENV_FILE)
    if not env_path.exists():
        return None
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.startswith("HA_TOKEN="):
            token = line.split("=", 1)[1].strip().strip("'\"")
            if token:
                status, _ = api("GET", "/api/", token=token)
                return token if status == 200 else None
    return None


def main():
    wait_for_ha()

    if token := existing_token_still_works():
        print(f"{ENV_FILE} already has a working HA_TOKEN — nothing to do.")
        sys.exit(0)

    done = onboarding_status()
    access_token = login_existing() if done.get("user") else onboard_fresh()

    token = asyncio.run(create_long_lived_token(access_token))
    write_env_token(token)
    print(
        "\nDone — HA_TOKEN is ready. scripts/fake-house-watch will pick it up "
        "automatically, or run: make fake-house"
    )


if __name__ == "__main__":
    main()
