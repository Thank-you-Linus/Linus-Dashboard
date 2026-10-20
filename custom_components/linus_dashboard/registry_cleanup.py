"""
Registry reconciliation for Linus Dashboard (#217).

Every platform reports the entities its build produces, at setup and at each
`_rebuild`. Anything of this config entry a settled build no longer produces is
removed from the registries:

1. entities whose unique_id no platform builds any more (a group that lost its
   last member, while Home Assistant was stopped or at runtime);
2. devices (area, floor, global "groups") that no built entity uses any more.

Removing a registry entry also removes the live entity, so a group dropped by
`_rebuild` disappears for good instead of staying "unavailable / restored".

A build is settled when it ran with Home Assistant running (`hass.is_running`,
the same test as PlatformGroupManager): at EVENT_HOMEASSISTANT_START, Home
Assistant writes an `unavailable` state for every enabled registry entry that
has none yet, so a build from then on sees the members of late-loading
integrations too. At boot, that is each platform's post-start rebuild
(PlatformGroupManager, STARTED + 2 s); at reload, the setup itself. A build
made before, or a rebuild that failed, settles nothing: its domain is left
alone, and the devices too, until every platform has a settled build.
"""

from __future__ import annotations

import logging
from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

_DATA_KEY = "registry_cleanup"


@dataclass
class _CleanupState:
    """What each platform built in this run, for one config entry."""

    platforms: tuple[str, ...]
    # platform domain -> {unique_id: device identifiers of that entity}
    built: dict[str, dict[str, set[tuple[str, str]]]] = field(default_factory=dict)
    # domains whose last build is settled (see the module docstring)
    settled: set[str] = field(default_factory=set)


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
    hass: HomeAssistant,
    entry: ConfigEntry,
    domain: str,
    entities: Iterable[Any],
    *,
    settled: bool | None = None,
) -> None:
    """
    Record everything `domain`'s build produces now, then clean up.

    `settled` defaults to `hass.is_running`; pass True for a build that reads
    no state (a domain excluded in the options builds nothing, at any time).
    """
    state = _state(hass, entry)
    if state is None:
        return
    state.built[domain] = {
        entity.unique_id: _device_identifiers(entity) for entity in entities
    }
    if settled is None:
        settled = hass.is_running
    if settled:
        state.settled.add(domain)
    else:
        state.settled.discard(domain)
    _async_reconcile(hass, entry, state)


@callback
def _async_reconcile(
    hass: HomeAssistant, entry: ConfigEntry, state: _CleanupState
) -> None:
    entity_reg = er.async_get(hass)
    for entity_entry in er.async_entries_for_config_entry(entity_reg, entry.entry_id):
        if entity_entry.domain not in state.settled:
            continue
        if entity_entry.unique_id in state.built[entity_entry.domain]:
            continue
        entity_reg.async_remove(entity_entry.entity_id)
        _LOGGER.info("Removed group no longer built: %s", entity_entry.entity_id)

    # A device is shared by every platform (an area's light, presence and
    # health entities): it is unused only once all of them have settled.
    if any(domain not in state.settled for domain in state.platforms):
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
