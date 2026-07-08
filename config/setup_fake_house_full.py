#!/usr/bin/env python3
"""Full bootstrap for the fake house test environment: areas, floors, native
"Random" sensor/binary_sensor helpers, and area assignment for every fake
house entity.

Run this once after a fresh `homeassistant/home-assistant` container's first
boot + admin account creation, so a new developer's HA test env ends up
identical to the reference one. Safe to re-run (idempotent): every step
checks current state before creating/assigning anything.

Why this exists / supersedes older scripts:
- `config/.storage/*` (area_registry, entity_registry, config_entries) is
  gitignored (see config/*.gitignore rule) and is per-instance runtime state,
  so none of this can be committed directly — it must be reconstructed via
  the HA API on each fresh instance.
- The old `setup_fake_house.sh` used the REST endpoint
  `PATCH /api/config/entity_registry/{entity_id}`, which does not exist on
  recent HA core versions (returns 404) — entity registry writes must go
  through the websocket API (`config/entity_registry/update`). This script
  replaces it.
- Areas/floors must also go through the websocket API
  (`config/area_registry/create`, `config/floor_registry/create`) — there is
  no REST equivalent.

Usage:
    HA_TOKEN=<long-lived-token> python3 setup_fake_house_full.py
    # or
    python3 setup_fake_house_full.py <token>

Requires: Python 3 stdlib + `websockets` (pip install websockets).
"""

import asyncio
import json
import os
import sys
import time
import urllib.error
import urllib.request

import websockets

HA_URL = os.environ.get("HA_URL", "http://homeassistant:8123")
HA_WS_URL = HA_URL.replace("https://", "wss://").replace("http://", "ws://") + "/api/websocket"
TOKEN = os.environ.get("HA_TOKEN") or (sys.argv[1] if len(sys.argv) > 1 else None)

if not TOKEN:
    print("ERROR: Provide HA_TOKEN env var or pass token as argument")
    sys.exit(1)

# ── Areas ────────────────────────────────────────────────────────────────
AREAS = [
    {"area_id": "salon", "name": "Salon", "icon": "mdi:sofa"},
    {"area_id": "chambre", "name": "Chambre", "icon": "mdi:bed"},
    {"area_id": "cuisine", "name": "Cuisine", "icon": "mdi:silverware-fork-knife"},
    {"area_id": "bureau", "name": "Bureau", "icon": "mdi:desk"},
    {"area_id": "salle_de_bain", "name": "Salle de bain", "icon": "mdi:shower"},
    {"area_id": "entree", "name": "Entrée", "icon": "mdi:door"},
]

# ── Floors ───────────────────────────────────────────────────────────────
FLOORS = [
    {"name": "Rez-de-chaussée", "level": 0, "areas": ["salon", "cuisine", "entree"]},
    {"name": "1er étage", "level": 1, "areas": ["chambre", "bureau", "salle_de_bain"]},
]

# ── Random helper entities (sensor / binary_sensor) ────────────────────
RANDOM_SENSORS = [
    {"name": "Temperature Salon", "device_class": "temperature", "unit_of_measurement": "°C", "minimum": 18, "maximum": 26, "area": "salon"},
    {"name": "Temperature Chambre", "device_class": "temperature", "unit_of_measurement": "°C", "minimum": 16, "maximum": 24, "area": "chambre"},
    {"name": "Temperature Cuisine", "device_class": "temperature", "unit_of_measurement": "°C", "minimum": 18, "maximum": 28, "area": "cuisine"},
    {"name": "Temperature Bureau", "device_class": "temperature", "unit_of_measurement": "°C", "minimum": 17, "maximum": 25, "area": "bureau"},
    {"name": "Humidity Salon", "device_class": "humidity", "unit_of_measurement": "%", "minimum": 35, "maximum": 65, "area": "salon"},
    {"name": "Humidity Chambre", "device_class": "humidity", "unit_of_measurement": "%", "minimum": 40, "maximum": 70, "area": "chambre"},
    {"name": "Humidity Cuisine", "device_class": "humidity", "unit_of_measurement": "%", "minimum": 45, "maximum": 80, "area": "cuisine"},
    {"name": "Humidity Bureau", "device_class": "humidity", "unit_of_measurement": "%", "minimum": 30, "maximum": 60, "area": "bureau"},
    {"name": "Humidity Salle de Bain", "device_class": "humidity", "unit_of_measurement": "%", "minimum": 50, "maximum": 95, "area": "salle_de_bain"},
    {"name": "Illuminance Salon", "device_class": "illuminance", "unit_of_measurement": "lx", "minimum": 0, "maximum": 800, "area": "salon"},
    {"name": "Illuminance Bureau", "device_class": "illuminance", "unit_of_measurement": "lx", "minimum": 0, "maximum": 800, "area": "bureau"},
]

RANDOM_BINARY_SENSORS = [
    {"name": "Motion Salon", "device_class": "motion", "area": "salon"},
    {"name": "Motion Chambre", "device_class": "motion", "area": "chambre"},
    {"name": "Motion Cuisine", "device_class": "motion", "area": "cuisine"},
    {"name": "Motion Bureau", "device_class": "motion", "area": "bureau"},
    {"name": "Motion Salle de Bain", "device_class": "motion", "area": "salle_de_bain"},
    {"name": "Motion Entree", "device_class": "motion", "area": "entree"},
    {"name": "Porte Entree", "device_class": "door", "area": "entree"},
]

# ── Every other fake_house.yaml entity → area (lights, covers, climate,
#    fans, switches, media_players — everything not covered by the Random
#    helpers above) ────────────────────────────────────────────────────
OTHER_ENTITY_AREAS = {
    "light.entree_lumiere": "entree",
    "light.chambre_lumiere": "chambre",
    "light.chambre_chevet": "chambre",
    "cover.volet_chambre": "chambre",
    "climate.thermostat_chambre": "chambre",
    "media_player.enceinte_chambre": "chambre",
    "light.cuisine_lumiere": "cuisine",
    "light.cuisine_plan_de_travail": "cuisine",
    "cover.volet_cuisine": "cuisine",
    "switch.lave_vaisselle": "cuisine",
    "switch.hotte_cuisine": "cuisine",
    "light.bureau_lumiere": "bureau",
    "light.bureau_lampe_de_bureau": "bureau",
    "cover.volet_bureau": "bureau",
    "fan.ventilateur_bureau": "bureau",
    "media_player.ecran_bureau": "bureau",
    "light.salle_de_bain": "salle_de_bain",
    "fan.extraction_sdb": "salle_de_bain",
    "light.salon_principal": "salon",
    "light.salon_deco": "salon",
    "light.salon_lampe": "salon",
    "cover.volet_salon": "salon",
    "climate.thermostat_salon": "salon",
    "media_player.tv_salon": "salon",
    "media_player.enceinte_salon": "salon",
}


def api(method, path, body=None):
    url = f"{HA_URL}{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
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
        status, _ = api("GET", "/api/")
        if status == 200:
            print("HA is ready\n")
            return
        time.sleep(3)
    print("ERROR: HA never became ready")
    sys.exit(1)


def existing_random_titles():
    status, entries = api("GET", "/api/config/config_entries/entry")
    if status != 200:
        print("FAIL listing config entries:", entries)
        sys.exit(1)
    return {e["title"] for e in entries if e["domain"] == "random"}


def create_random_entity(entity_type, name, extra_fields):
    status, flow = api("POST", "/api/config/config_entries/flow", {"handler": "random"})
    if status != 200:
        print(f"FAIL start flow for {name}:", flow)
        return False
    flow_id = flow["flow_id"]
    status, step = api("POST", f"/api/config/config_entries/flow/{flow_id}", {"next_step_id": entity_type})
    if status != 200:
        print(f"FAIL menu step for {name}:", step)
        return False
    form = {"name": name, **extra_fields}
    status, result = api("POST", f"/api/config/config_entries/flow/{flow_id}", form)
    if status != 200 or result.get("type") != "create_entry":
        print(f"FAIL create_entry for {name}:", result)
        return False
    print(f"CREATED: {name} ({entity_type})")
    return True


def slug(name):
    return (
        name.lower()
        .replace(" ", "_")
        .replace("é", "e")
        .replace("è", "e")
    )


class WS:
    def __init__(self, ws):
        self.ws = ws
        self.msg_id = 1

    async def call(self, payload):
        payload["id"] = self.msg_id
        self.msg_id += 1
        await self.ws.send(json.dumps(payload))
        return json.loads(await self.ws.recv())


async def bootstrap_ws():
    async with websockets.connect(HA_WS_URL, max_size=10_000_000) as raw_ws:
        msg = json.loads(await raw_ws.recv())
        assert msg["type"] == "auth_required"
        await raw_ws.send(json.dumps({"type": "auth", "access_token": TOKEN}))
        auth_result = json.loads(await raw_ws.recv())
        if auth_result["type"] != "auth_ok":
            print("AUTH FAILED", auth_result)
            sys.exit(1)
        ws = WS(raw_ws)

        print("--- Areas ---")
        resp = await ws.call({"type": "config/area_registry/list"})
        existing_areas = {a["area_id"] for a in resp["result"]}
        for area in AREAS:
            if area["area_id"] in existing_areas:
                print(f"SKIP (exists): area {area['area_id']}")
                continue
            resp = await ws.call({
                "type": "config/area_registry/create",
                "name": area["name"],
                "icon": area["icon"],
            })
            if resp.get("success"):
                got_id = resp["result"]["area_id"]
                status = "OK" if got_id == area["area_id"] else f"WARNING: got id '{got_id}', expected '{area['area_id']}'"
                print(f"CREATED: area {area['name']} -> {got_id} ({status})")
            else:
                print(f"FAIL creating area {area['name']}:", resp)

        print("\n--- Floors ---")
        resp = await ws.call({"type": "config/floor_registry/list"})
        existing_floors = {f["name"]: f["floor_id"] for f in resp["result"]}
        floor_id_by_name = {}
        for floor in FLOORS:
            if floor["name"] in existing_floors:
                floor_id_by_name[floor["name"]] = existing_floors[floor["name"]]
                print(f"SKIP (exists): floor {floor['name']}")
                continue
            resp = await ws.call({
                "type": "config/floor_registry/create",
                "name": floor["name"],
                "level": floor["level"],
            })
            if resp.get("success"):
                fid = resp["result"]["floor_id"]
                floor_id_by_name[floor["name"]] = fid
                print(f"CREATED: floor {floor['name']} -> {fid}")
            else:
                print(f"FAIL creating floor {floor['name']}:", resp)

        print("\n--- Floor <-> Area assignment ---")
        for floor in FLOORS:
            fid = floor_id_by_name.get(floor["name"])
            if not fid:
                continue
            for area_id in floor["areas"]:
                resp = await ws.call({
                    "type": "config/area_registry/update",
                    "area_id": area_id,
                    "floor_id": fid,
                })
                print(f"{'OK' if resp.get('success') else 'FAIL'}: area {area_id} -> floor {floor['name']}")

        print("\n--- Entity area assignment ---")
        assignments = dict(OTHER_ENTITY_AREAS)
        for s in RANDOM_SENSORS:
            assignments[f"sensor.{slug(s['name'])}"] = s["area"]
        for b in RANDOM_BINARY_SENSORS:
            assignments[f"binary_sensor.{slug(b['name'])}"] = b["area"]

        for entity_id, area_id in assignments.items():
            resp = await ws.call({
                "type": "config/entity_registry/update",
                "entity_id": entity_id, "area_id": area_id,
            })
            print(f"{'OK' if resp.get('success') else 'FAIL'}: {entity_id} -> {area_id}"
                  + ("" if resp.get("success") else f" ({resp})"))


def bootstrap_random_entities():
    print("--- Random sensor/binary_sensor helpers ---")
    existing = existing_random_titles()
    for s in RANDOM_SENSORS:
        if s["name"] in existing:
            print(f"SKIP (exists): {s['name']}")
            continue
        create_random_entity("sensor", s["name"], {
            "minimum": s["minimum"], "maximum": s["maximum"],
            "device_class": s["device_class"], "unit_of_measurement": s["unit_of_measurement"],
        })
    for b in RANDOM_BINARY_SENSORS:
        if b["name"] in existing:
            print(f"SKIP (exists): {b['name']}")
            continue
        create_random_entity("binary_sensor", b["name"], {"device_class": b["device_class"]})


def main():
    wait_for_ha()
    bootstrap_random_entities()
    print()
    asyncio.run(bootstrap_ws())
    print("\nDone.")


if __name__ == "__main__":
    main()
