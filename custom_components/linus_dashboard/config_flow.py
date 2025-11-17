"""Config flow for Linus Dashboard integration."""

from __future__ import annotations

import contextlib
import logging
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components.binary_sensor import BinarySensorDeviceClass
from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import Platform
from homeassistant.helpers import (
    device_registry as dr,
)
from homeassistant.helpers import (
    label_registry as lr,
)
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TargetSelector,
    TargetSelectorConfig,
)
from homeassistant.helpers.storage import Store
from homeassistant.helpers.translation import async_get_translations
from homeassistant.util import slugify

from .const import (
    CONF_ALARM_ENTITY_IDS,
    CONF_EMBEDDED_DASHBOARDS,
    CONF_EXCLUDED_DEVICE_CLASSES,
    CONF_EXCLUDED_DOMAINS,
    CONF_EXCLUDED_INTEGRATIONS,
    CONF_EXCLUDED_TARGETS,
    CONF_HIDE_GREETING,
    CONF_WEATHER_ENTITY,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class NullableEntitySelector(EntitySelector):
    """Entity selector that supports null values."""

    def __call__(self, data: str | None) -> str | None:
        """Validate the passed selection, if passed."""
        if data in (None, ""):
            return data

        return super().__call__(data)


class LinusDashboardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Linus Dashboard."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(title="Linus Dashboard", data={})

        return self.async_show_form(step_id="user")

    @staticmethod
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> LinusDashboardEditFlow:
        """Create the options flow."""
        return LinusDashboardEditFlow(config_entry)


class LinusDashboardEditFlow(config_entries.OptionsFlow):
    """Linus Dashboard options edit flow with thematic organization."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize the options flow."""
        self._config_entry = config_entry
        self._dashboard_config = {}  # Store temporary config during multi-step flow

    async def _get_current_language(self) -> str:
        """Get the current user's frontend language dynamically."""
        try:
            # Get all users and find frontend preferences
            users = await self.hass.auth.async_get_users()
            for user in users:
                if not user.system_generated and user.is_active:
                    # Try to get user's frontend preferences
                    store_key = f"frontend.user_data_{user.id}"
                    try:
                        store = Store(self.hass, 1, store_key)
                        user_data = await store.async_load()
                        if user_data and "language" in user_data:
                            if isinstance(user_data["language"], dict):
                                lang = user_data["language"].get("language")
                            else:
                                lang = user_data["language"]

                            if lang:
                                return lang
                    except (OSError, ValueError, KeyError):
                        continue

        except (AttributeError, KeyError):
            pass

        # Fallback: try hass.config.language, else default to "en"
        return getattr(self.hass.config, "language", None) or "en"

    def _format_name(self, name: str) -> str:
        """Format a name by replacing underscores with spaces and capitalizing."""
        return name.replace("_", " ").title()

    def _extract_value_from_display_string(
        self, display_string: str, separator: str = " ("
    ) -> str:
        """Extract the original value from a formatted display string."""
        if separator in display_string:
            return display_string.split(separator)[0]
        if " - " in display_string:
            return display_string.split(" - ")[0]
        return display_string

    async def _process_form_data(self, form_data: dict[str, Any]) -> dict[str, Any]:
        """Process form data to extract original values from display labels."""
        # Get all dynamic options
        options = {
            CONF_EXCLUDED_TARGETS: await self._get_device_options(),
            CONF_EXCLUDED_DOMAINS: await self._get_domain_options(),
            CONF_EXCLUDED_DEVICE_CLASSES: await self._get_device_class_options(),
            CONF_EXCLUDED_INTEGRATIONS: await self._get_integration_options(),
        }

        # Create reverse mappings (label -> value)
        mappings = {
            key: {opt["label"]: opt["value"] for opt in opts}
            for key, opts in options.items()
        }

        processed_data = {}
        for key, value in form_data.items():
            if key in mappings and isinstance(value, list):
                processed_data[key] = [mappings[key].get(v, v) for v in value]
            # Handle TargetSelector (target)
            elif key == CONF_EXCLUDED_TARGETS and isinstance(value, dict):
                # Store the target dict as-is (Home Assistant expects this format)
                processed_data[key] = value
            else:
                processed_data[key] = value

        return processed_data

    def _convert_values_to_labels(
        self, values: list[str], options_map: list[dict[str, str]]
    ) -> list[str]:
        """Convert technical values to display labels for form defaults."""
        if not values:
            return []

        value_to_label = {opt["value"]: opt["label"] for opt in options_map}
        return [value_to_label.get(v, v) for v in values]

    async def _get_domain_options(self) -> list[dict[str, str]]:
        """Get domain options with translations."""
        domains = []

        domain_set = set()
        # Use all available platforms from Home Assistant as domains
        domain_set = {platform.value for platform in Platform}

        # Get translations using the entity_component category with dynamic language
        lang = await self._get_current_language()
        translations = {}

        try:
            entity_translations = await async_get_translations(
                self.hass, lang, "entity_component", integrations=list(domain_set)
            )

            if entity_translations and lang in entity_translations:
                translations = entity_translations[lang]
            elif entity_translations and isinstance(entity_translations, dict):
                # Sometimes translations come directly without language wrapper
                translations = entity_translations

        except (KeyError, TypeError, ValueError):
            pass

        for domain in sorted(domain_set):
            # Use exact format from frontend translations you provided
            display_name = domain
            translation_key = f"component.{domain}.entity_component._.name"

            if isinstance(translations, dict) and translation_key in translations:
                display_name = translations[translation_key]
            else:
                # Fallback to formatted domain name
                display_name = self._format_name(domain)

            domains.append({
                "value": domain,
                "label": display_name.title() if display_name else domain.title(),
            })

        return domains

    def _is_user_relevant_integration(
        self, domain: str, config_entry: config_entries.ConfigEntry | None = None
    ) -> bool:
        """Determine if an integration should be shown to users dynamically."""
        # Skip our own integration
        if domain == "linus_dashboard":
            return False

        # If it has a config entry, it's probably a real integration
        if config_entry:
            # Skip if it has no title (usually system entries)
            return bool(config_entry.title)

        # For domains without config entries, check if they're actual integrations
        # vs entity domains by checking if they're in loaded components
        if domain not in self.hass.config.components:
            return False

        # Check if the domain has manifest info (real integrations have manifests)
        try:
            if hasattr(self.hass, "data") and "integrations" in self.hass.data:
                integration_data = self.hass.data["integrations"].get(domain)
                if integration_data and hasattr(integration_data, "manifest"):
                    manifest = integration_data.manifest
                    # Real integrations usually have proper manifests
                    return bool(manifest.get("name") and manifest.get("version"))
        except (AttributeError, KeyError):
            pass

        return False

    async def _get_integration_options(self) -> list[dict[str, str]]:
        """Get user-relevant integration options dynamically."""
        try:
            integration_options = []
            processed_domains = set()

            # Get integrations from config entries first
            for config_entry in self.hass.config_entries.async_entries():
                domain = config_entry.domain
                is_relevant = self._is_user_relevant_integration(domain, config_entry)

                if not is_relevant:
                    continue

                if domain in processed_domains:
                    continue

                processed_domains.add(domain)

                # Try to get the real integration name from manifest
                integration_name = config_entry.title

                # Try to get proper name from integration manifest
                try:
                    if hasattr(self.hass, "data") and "integrations" in self.hass.data:
                        integration_data = self.hass.data["integrations"].get(domain)
                        if integration_data and hasattr(integration_data, "manifest"):
                            manifest_name = integration_data.manifest.get("name")
                            if manifest_name:
                                integration_name = manifest_name
                except (AttributeError, KeyError):
                    pass

                # Fallback to formatted domain name if no better name found
                if not integration_name:
                    integration_name = self._format_name(domain)

                integration_options.append({
                    "value": domain,
                    "label": integration_name,
                })

            return sorted(integration_options, key=lambda x: x["label"])

        except (AttributeError, KeyError, TypeError) as e:
            _LOGGER.warning("Error getting integrations: %s", e)
            return []

    async def _get_available_dashboard_views(self) -> list[dict[str, str]]:
        """Get available dashboard views (dashboard + view combinations)."""
        lovelace_data = self.hass.data.get("lovelace")
        if not lovelace_data:
            return []

        dashboard_views = []

        async def process_dashboard(
            config: dict, title: str, url_path: str, emoji: str
        ) -> None:
            """Process a dashboard and extract its views."""
            if not config or "views" not in config:
                return

            for idx, view in enumerate(config["views"]):
                view_title = view.get("title", f"View {idx}")
                dashboard_views.append({
                    "value": f"{url_path}|{idx}|{view.get('path', '')}",
                    "label": f"{emoji} {title} > {view_title}",
                    "dashboard": url_path,
                    "view_index": idx,
                    "view_title": view_title,
                    "view_path": view.get("path", ""),
                    "view_icon": view.get("icon", "mdi:view-dashboard"),
                })

        try:
            # Process main dashboard
            if hasattr(lovelace_data, "config"):
                await process_dashboard(
                    lovelace_data.config, "Main Dashboard", "lovelace", "🏠"
                )

            # Process custom dashboards
            if hasattr(lovelace_data, "dashboards"):
                for dashboard_obj in lovelace_data.dashboards.values():
                    title = url_path = getattr(dashboard_obj, "url_path", "unknown")
                    config = None

                    if hasattr(dashboard_obj, "config") and isinstance(
                        dashboard_obj.config, dict
                    ):
                        title = dashboard_obj.config.get("title", title)
                        url_path = dashboard_obj.config.get("url_path", url_path)

                    if hasattr(dashboard_obj, "async_load"):
                        with contextlib.suppress(Exception):
                            config = await dashboard_obj.async_load(force=False)

                    await process_dashboard(config, title, url_path, "📊")

            return sorted(dashboard_views, key=lambda x: x["label"])

        except (AttributeError, KeyError, TypeError) as e:
            _LOGGER.warning("Error getting dashboard views: %s", e)
            return []

    async def _get_device_options(self) -> list[dict[str, str]]:
        """Get device options dynamically, filtering out HA created devices."""
        try:
            device_registry = dr.async_get(self.hass)

            # Use list comprehension for better performance
            devices = [
                {
                    "value": device.id,
                    "label": f"{device.name} ({device.manufacturer})",
                }
                for device in device_registry.devices.values()
                if (
                    device.name
                    and device.config_entries
                    and device.manufacturer
                    and device.manufacturer.lower() != "home assistant"
                )
            ]

            return sorted(devices, key=lambda x: x["label"])
        except (AttributeError, KeyError, TypeError) as e:
            _LOGGER.warning("Error getting devices: %s", e)
            return []

    async def _get_device_class_options(self) -> list[dict[str, str]]:
        """Get device class options dynamically with Home Assistant translations."""
        try:
            device_classes_by_domain = self._collect_device_classes()
            if not device_classes_by_domain:
                return []

            translations = await self._get_device_class_translations(
                device_classes_by_domain
            )
            return self._build_device_class_options(
                device_classes_by_domain, translations
            )
        except (AttributeError, KeyError, TypeError) as e:
            _LOGGER.warning("Error getting device classes: %s", e)
            return []

    def _collect_device_classes(self) -> dict[str, set[str]]:
        """Collect device classes grouped by domain."""
        device_classes_by_domain = {}

        # Add all known Sensor and BinarySensor device classes
        try:
            for device_class in list(SensorDeviceClass):
                domain = "sensor"
                if domain not in device_classes_by_domain:
                    device_classes_by_domain[domain] = set()
                device_classes_by_domain[domain].add(device_class.value)

            for device_class in list(BinarySensorDeviceClass):
                domain = "binary_sensor"
                if domain not in device_classes_by_domain:
                    device_classes_by_domain[domain] = set()
                device_classes_by_domain[domain].add(device_class.value)
        except ImportError:
            pass

        return device_classes_by_domain

    async def _get_device_class_translations(
        self, device_classes_by_domain: dict[str, set[str]]
    ) -> dict:
        """Get translations for device classes."""
        lang = await self._get_current_language()
        all_domains = list(device_classes_by_domain.keys())

        component_translations = await async_get_translations(
            self.hass, lang, "component", integrations=all_domains
        )
        entity_component_translations = await async_get_translations(
            self.hass, lang, "entity_component", integrations=all_domains
        )

        return {
            "component": component_translations,
            "entity_component": entity_component_translations,
        }

    def _build_device_class_options(
        self, device_classes_by_domain: dict[str, set[str]], translations: dict
    ) -> list[dict[str, str]]:
        """Build device class options with translations."""
        device_class_options = []
        component_translations = translations["component"]
        entity_component_translations = translations["entity_component"]

        for domain, device_classes in device_classes_by_domain.items():
            # Get domain translation
            translated_domain = self._get_translated_domain(
                domain, entity_component_translations
            )

            for device_class in sorted(device_classes):
                translated_class = self._get_translated_device_class(
                    device_class,
                    domain,
                    component_translations,
                    entity_component_translations,
                )

                device_class_options.append({
                    "value": device_class,
                    "label": f"{translated_class} ({translated_domain})",
                })

        return sorted(device_class_options, key=lambda x: x["label"])

    def _get_translated_domain(
        self, domain: str, entity_component_translations: dict
    ) -> str:
        """Get translated domain name."""
        # Use the same translation key pattern that works for domain options
        translation_key = f"component.{domain}.entity_component._.name"

        translated_domain = entity_component_translations.get(translation_key)
        if translated_domain:
            return translated_domain

        return self._format_name(domain)

    def _get_translated_device_class(
        self,
        device_class: str,
        domain: str,
        component_translations: dict,
        entity_component_translations: dict,
    ) -> str:
        """Get translated device class name."""
        device_class_keys = [
            f"component.{domain}.entity_component.{device_class}.name",
            f"component.{domain}.device_class.{device_class}",
            f"entity_component.{domain}.device_class.{device_class}",
            f"entity_component._.device_class.{device_class}",
        ]

        # Try entity_component translations first
        for key in device_class_keys:
            translated_class = entity_component_translations.get(key)
            if translated_class:
                return translated_class

        # If not found, try component translations
        for key in device_class_keys:
            translated_class = component_translations.get(key)
            if translated_class:
                return translated_class

        # If still not found, format the device class name
        return self._format_name(device_class)

    async def _get_label_options(self) -> list[dict[str, str]]:
        """Get label options."""
        try:
            label_registry = lr.async_get(self.hass)
            return [
                {"value": label.label_id, "label": label.name}
                for label in label_registry.labels.values()
            ]
        except (AttributeError, KeyError, TypeError) as e:
            _LOGGER.warning("Error getting labels: %s", e)
            return []

    def _build_basic_config_section(
        self, current_options: dict[str, Any]
    ) -> dict[vol.Optional, Any]:
        """Build basic configuration section."""
        return {
            vol.Optional(
                CONF_ALARM_ENTITY_IDS,
                default=current_options.get(CONF_ALARM_ENTITY_IDS, []),
                description={"name": "Alarmes"},
            ): NullableEntitySelector(
                EntitySelectorConfig(
                    domain="alarm_control_panel",
                    multiple=True,
                )
            ),
            vol.Optional(
                CONF_WEATHER_ENTITY,
                default=current_options.get(CONF_WEATHER_ENTITY, ""),
                description={"name": "Entité Météo"},
            ): NullableEntitySelector(EntitySelectorConfig(domain="weather")),
            vol.Optional(
                CONF_HIDE_GREETING,
                default=current_options.get(CONF_HIDE_GREETING, False),
                description={"name": "Masquer la salutation"},
            ): BooleanSelector(),
        }

    def _create_selector_config(self, options: list[dict[str, str]]) -> SelectSelector:
        """Create a SelectSelector configuration."""
        return SelectSelector(
            SelectSelectorConfig(
                options=[opt["label"] for opt in options],
                multiple=True,
                mode=SelectSelectorMode.DROPDOWN,
            )
        )

    def _build_exclusion_section(
        self,
        current_options: dict[str, Any],
        **options: list[dict[str, str]],
    ) -> dict[vol.Optional, Any]:
        """Build exclusion configuration section."""
        domain_options = options.get("domain_options", [])
        integration_options = options.get("integration_options", [])
        device_class_options = options.get("device_class_options", [])

        return {
            vol.Optional(
                CONF_EXCLUDED_TARGETS,
                default=current_options.get(CONF_EXCLUDED_TARGETS, {}),
            ): TargetSelector(TargetSelectorConfig()),
            vol.Optional(
                CONF_EXCLUDED_DOMAINS,
                default=self._convert_values_to_labels(
                    current_options.get(CONF_EXCLUDED_DOMAINS, []), domain_options
                ),
            ): self._create_selector_config(domain_options),
            vol.Optional(
                CONF_EXCLUDED_DEVICE_CLASSES,
                default=self._convert_values_to_labels(
                    current_options.get(CONF_EXCLUDED_DEVICE_CLASSES, []),
                    device_class_options,
                ),
            ): self._create_selector_config(device_class_options),
            vol.Optional(
                CONF_EXCLUDED_INTEGRATIONS,
                default=self._convert_values_to_labels(
                    current_options.get(CONF_EXCLUDED_INTEGRATIONS, []),
                    integration_options,
                ),
            ): self._create_selector_config(integration_options),
        }

    async def _build_form_schema(self) -> vol.Schema:
        """Build the complete form schema organized by thematic sections."""
        # Get all dynamic options with translations
        domain_options = await self._get_domain_options()
        integration_options = await self._get_integration_options()
        device_class_options = await self._get_device_class_options()

        # Get current configuration values
        current_options = dict(self._config_entry.options)

        # Build thematic sections
        basic_config = self._build_basic_config_section(current_options)

        # Add embedded dashboards multi-select with reordering
        dashboard_views = await self._get_available_dashboard_views()
        _LOGGER.info("Available dashboard views for config: %d", len(dashboard_views))

        if dashboard_views:
            # Create simple string options (label will be shown in UI)
            view_options = [dv["label"] for dv in dashboard_views]

            # Get currently selected views - convert to labels for display
            current_embedded = current_options.get(CONF_EMBEDDED_DASHBOARDS, [])
            views_dict = {dv["value"]: dv["label"] for dv in dashboard_views}
            current_selected = []
            for d in current_embedded:
                view_key = (
                    f"{d['dashboard']}|{d.get('view_index', '')}|"
                    f"{d.get('view_path', '')}"
                )
                label = views_dict.get(view_key)
                if label:
                    current_selected.append(label)

            _LOGGER.info("Current selected labels: %s", current_selected)

            basic_config[
                vol.Optional(
                    CONF_EMBEDDED_DASHBOARDS,
                    description={
                        "suggested_value": current_selected,
                    },
                    default=current_selected,
                )
            ] = SelectSelector(
                SelectSelectorConfig(
                    options=view_options,
                    multiple=True,
                    custom_value=False,
                    mode=SelectSelectorMode.DROPDOWN,
                )
            )
        else:
            _LOGGER.warning("No dashboard views found!")

        exclusion_config = self._build_exclusion_section(
            current_options,
            domain_options=domain_options,
            integration_options=integration_options,
            device_class_options=device_class_options,
        )

        # Combine all sections in logical order
        complete_schema = {**basic_config, **exclusion_config}

        return vol.Schema(complete_schema)

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Manage the options with thematic organization."""
        if user_input is not None:
            # Process embedded dashboards selection
            selected_labels = user_input.get(CONF_EMBEDDED_DASHBOARDS, [])
            embedded_dashboards = []

            # Get all available views for lookup
            dashboard_views = await self._get_available_dashboard_views()
            # Create reverse lookup: label -> view info
            label_to_view = {dv["label"]: dv for dv in dashboard_views}

            # Parse each selected label and build dashboard config
            for label in selected_labels:
                # Get view info from label
                view_info = label_to_view.get(label)
                if not view_info:
                    _LOGGER.warning("View not found for label: %s", label)
                    continue

                # Build config using view information
                dashboard_config = {
                    "dashboard": view_info["dashboard"],
                    "view_index": view_info["view_index"],
                    "title": view_info["view_title"],
                    "icon": view_info.get("view_icon", "mdi:view-dashboard"),
                    "path": slugify(
                        f"{view_info['dashboard']}_{view_info['view_title']}"
                    ),
                }

                # Add view path if available
                if view_info.get("view_path"):
                    dashboard_config["view_path"] = view_info["view_path"]

                embedded_dashboards.append(dashboard_config)

            # Update user_input with processed embedded dashboards
            user_input[CONF_EMBEDDED_DASHBOARDS] = embedded_dashboards

            # Process form data to extract original values from display strings
            processed_data = await self._process_form_data(user_input)
            return self.async_create_entry(title="", data=processed_data)

        schema = await self._build_form_schema()

        return self.async_show_form(
            step_id="init",
            data_schema=schema,
            description_placeholders={
                "docs_url": "https://github.com/Thank-you-Linus/Linus-Dashboard"
            },
        )
