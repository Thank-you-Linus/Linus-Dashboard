"""
Registry reconciliation for Linus Dashboard (#217).

Every platform reports the entities its build produces, at setup and at each
`_rebuild`. Once the cleanup is ready, anything of this config entry the build
no longer produces is removed from the registries:

1. entities whose unique_id no platform builds any more (a group that lost its
   last member, while Home Assistant was stopped or at runtime);
2. devices (area, floor, global "groups") that no built entity uses any more.

Removing a registry entry also removes the live entity, so a group dropped by
`_rebuild` disappears for good instead of staying "unavailable / restored".

Ready means every member of a group has a state to be scanned: at
EVENT_HOMEASSISTANT_START, Home Assistant writes an `unavailable` state for
every enabled registry entry that has none yet, so the post-start rebuilds
(PlatformGroupManager, STARTED + 2 s) see members of late-loading integrations
too. The cleanup therefore waits for STARTED + READY_DELAY, after those
rebuilds, or runs right after setup when Home Assistant is already running
(reload). Before that, nothing is removed.
"""

from __future__ import annotations

import logging
from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_call_later

from .const import DOMAIN
from .group_manager import _async_listen_started_once

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

# Seconds after EVENT_HOMEASSISTANT_STARTED before the first cleanup: past the
# platforms' own post-start rebuild (PlatformGroupManager's 2 s startup delay).
READY_DELAY = 10.0

_DATA_KEY = "registry_cleanup"


@dataclass
class _CleanupState:
    """What each platform built in this run, for one config entry."""

    platforms: tuple[str, ...]
    # platform domain -> {unique_id: device identifiers of that entity}
    built: dict[str, dict[str, set[tuple[str, str]]]] = field(default_factory=dict)
    ready: bool = False


def _state(hass: HomeAssistant, entry: ConfigEntry) -> _CleanupState | None:
    return hass.data.get(DOMAIN, {}).get(_DATA_KEY, {}).get(entry.entry_id)


def _device_identifiers(entity: Any) -> set[tuple[str, str]]:
    device_info = entity.device_info or {}
    return set(device_info.get("identifiers") or ())


def async_init(
    hass: HomeAssistant, entry: ConfigEntry, platforms: Iterable[str]
) -> None:
    """Start a fresh run for this config entry (setup or reload)."""
    hass.data.setdefault(DOMAIN, {}).setdefault(_DATA_KEY, {})[entry.entry_id] = (
        _CleanupState(platforms=tuple(platforms))
    )


@callback
def async_report_built(
    hass: HomeAssistant, entry: ConfigEntry, domain: str, entities: Iterable[Any]
) -> None:
    """Record everything `domain`'s build produces now; clean up if ready."""
    state = _state(hass, entry)
    if state is None:
        return
    state.built[domain] = {
        entity.unique_id: _device_identifiers(entity) for entity in entities
    }
    if state.ready:
        _async_reconcile(hass, entry, state)


def async_schedule_ready(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """
    Make the cleanup ready: now if Home Assistant is running (every platform
    has reported by the end of setup), else READY_DELAY after STARTED.
    """
    if hass.is_running:
        _async_set_ready(hass, entry)
        return

    @callback
    def _ready(_now: Any) -> None:
        _async_set_ready(hass, entry)

    @callback
    def _on_started(_event: Event) -> None:
        entry.async_on_unload(async_call_later(hass, READY_DELAY, _ready))

    entry.async_on_unload(_async_listen_started_once(hass, _on_started))


@callback
def _async_set_ready(hass: HomeAssistant, entry: ConfigEntry) -> None:
    state = _state(hass, entry)
    if state is None:
        return
    state.ready = True
    _async_reconcile(hass, entry, state)


@callback
def _async_reconcile(
    hass: HomeAssistant, entry: ConfigEntry, state: _CleanupState
) -> None:
    entity_reg = er.async_get(hass)
    for entity_entry in er.async_entries_for_config_entry(entity_reg, entry.entry_id):
        built = state.built.get(entity_entry.domain)
        if built is None or entity_entry.unique_id in built:
            continue
        entity_reg.async_remove(entity_entry.entity_id)
        _LOGGER.info("Removed group no longer built: %s", entity_entry.entity_id)

    # A device is shared by every platform (an area's light, presence and
    # health entities): it is unused only once all of them have reported.
    if any(domain not in state.built for domain in state.platforms):
        return
    used = _used_identifiers(state)
    device_reg = dr.async_get(hass)
    for device in dr.async_entries_for_config_entry(device_reg, entry.entry_id):
        if device.identifiers & used:
            continue
        device_reg.async_update_device(device.id, remove_config_entry_id=entry.entry_id)
        _LOGGER.info("Removed group device no longer used: %s", device.name)


def _used_identifiers(state: _CleanupState) -> set[tuple[str, str]]:
    used: set[tuple[str, str]] = set()
    for built in state.built.values():
        for identifiers in built.values():
            used |= identifiers
    return used


def async_device_is_removable(
    hass: HomeAssistant, entry: ConfigEntry, device: dr.DeviceEntry
) -> bool:
    """Whether the user may delete `device`: no built entity uses it."""
    state = _state(hass, entry)
    if state is None:
        return True
    return not device.identifiers & _used_identifiers(state)


def async_unload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Forget this config entry's run."""
    hass.data.get(DOMAIN, {}).get(_DATA_KEY, {}).pop(entry.entry_id, None)
