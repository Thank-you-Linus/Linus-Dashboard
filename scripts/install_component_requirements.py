#!/usr/bin/env python3
"""
Pre-install every Home Assistant component's declared pip requirements.

HA lazily installs a component's requirements the first time it's set up,
which fails in offline/sandboxed environments (and in CI, silently drops that
component instead of erroring loudly). Worse, if the *frontend* component's
requirement (home-assistant-frontend) is missing, HA logs "frontend did not
load" and falls back to recovery mode, which skips `packages:` entirely —
so every entity defined via `!include_dir_named packages` (the fake house)
silently vanishes with no explicit error pointing at the real cause.

Scans every manifest.json under the installed `homeassistant` package for its
"requirements" list and pip-installs the union upfront, so the server starts
cleanly regardless of which components get loaded. Works whether homeassistant
is installed in a venv or in the system/CI Python — it locates the package via
import rather than assuming a fixed ha-env/ layout, and installs with
sys.executable so it always targets the same interpreter running this script.

Usage:
    python3 scripts/install_component_requirements.py [--break-system-packages]
"""

import json
import subprocess
import sys
from pathlib import Path


def main():
    try:
        import homeassistant
    except ImportError:
        print("  ⚠️  HA not installed yet, skipping component dependency resolution.")
        return

    components_dir = Path(homeassistant.__file__).parent / "components"
    requirements = set()
    for manifest in components_dir.glob("*/manifest.json"):
        try:
            data = json.loads(manifest.read_text(encoding="utf-8"))
            requirements.update(data.get("requirements", []))
        except (OSError, json.JSONDecodeError):
            pass

    print(
        f"  Installing {len(requirements)} component requirement(s) "
        "(already-installed packages will be skipped)..."
    )
    cmd = [
        sys.executable,
        "-m",
        "pip",
        "install",
        "--quiet",
        *sys.argv[1:],
        *sorted(requirements),
    ]
    # Fixed args + pinned versions from HA's own manifests, plus CLI flags we
    # control (--break-system-packages) — not attacker-influenced input.
    result = subprocess.run(cmd, check=False)  # noqa: S603
    if result.returncode != 0:
        print(
            "  ⚠️  Some requirements failed to install (non-fatal, may be platform-specific packages)."
        )
    else:
        print("  ✅ All component dependencies ready.")


if __name__ == "__main__":
    main()
