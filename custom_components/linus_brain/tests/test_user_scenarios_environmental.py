"""
Tests de scénarios utilisateur pour le système d'éclairage automatique environnemental.

Ces tests simulent des scénarios réels d'utilisation avec des transitions
environnementales (jour/nuit) pour valider le comportement du système de cooldown
enter/exit du point de vue de l'utilisateur.

Scénarios testés:
1. Journée nuageuse avec variations rapides de luminosité
2. Transition crépusculaire graduelle
3. Utilisation quotidienne normale (matin → soir)
4. Journée ensoleillée avec nuages passagers
"""

import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util import dt as dt_util

from ..utils.rule_engine import RuleEngine


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock()
    hass.data = {"linus_brain": {}}
    hass.config.language = "en"
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    return hass


@pytest.fixture
def mock_activity_tracker():
    """Mock ActivityTracker with movement."""
    tracker = MagicMock()
    tracker.async_initialize = AsyncMock()
    tracker.async_evaluate_activity = AsyncMock(return_value="movement")
    tracker.get_activity = MagicMock(return_value="movement")
    return tracker


@pytest.fixture
def mock_area_manager():
    """Mock AreaManager with environmental sensors."""
    manager = MagicMock()

    # Return binary motion sensor when requested
    def get_area_entities(area_id, domain=None, device_class=None):
        if domain == "sensor" and device_class == "illuminance":
            return ["sensor.living_room_illuminance"]
        if domain == "binary_sensor" and device_class == "motion":
            return ["binary_sensor.living_room_motion"]
        return []

    manager.get_area_entities = MagicMock(side_effect=get_area_entities)
    manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": False, "illuminance": 500}
    )
    return manager


@pytest.fixture
def mock_app_storage():
    """Mock AppStorage with automatic lighting app with on_exit actions."""
    storage = MagicMock()

    autolight_app = {
        "app_id": "automatic_lighting",
        "app_name": "Automatic Lighting",
        "activity_actions": {
            "movement": {
                "conditions": [
                    {
                        "condition": "area_state",
                        "area_id": "current",
                        "attribute": "is_dark",
                    }
                ],
                "actions": [
                    {
                        "service": "light.turn_on",
                        "domain": "light",
                        "area": "current",
                        "data": {"brightness_pct": 100},
                    }
                ],
                "on_exit": [
                    {
                        "service": "light.turn_off",
                        "domain": "light",
                        "area": "current",
                    }
                ],
                "logic": "and",
            },
            "empty": {
                "conditions": [],
                "actions": [
                    {
                        "service": "light.turn_off",
                        "domain": "light",
                        "area": "current",
                    }
                ],
                "logic": "and",
            },
        },
    }

    storage.get_assignments = MagicMock(
        return_value={
            "living_room": {
                "area_id": "living_room",
                "app_id": "automatic_lighting",
                "enabled": True,
            }
        }
    )
    storage.get_assignment = MagicMock(
        return_value={
            "area_id": "living_room",
            "app_id": "automatic_lighting",
            "enabled": True,
        }
    )
    storage.get_app = MagicMock(return_value=autolight_app)
    storage.get_apps = MagicMock(return_value={"automatic_lighting": autolight_app})
    storage.remove_assignment = MagicMock()
    storage.async_save = AsyncMock(return_value=True)
    return storage


@pytest.fixture
def rule_engine(mock_hass, mock_activity_tracker, mock_app_storage, mock_area_manager):
    """Create RuleEngine instance."""
    return RuleEngine(
        mock_hass,
        "test_entry",
        mock_activity_tracker,
        mock_app_storage,
        mock_area_manager,
    )


class TestUserScenarioCloudyDay:
    """
    Scénario: Journée nuageuse avec variations rapides de luminosité.

    L'utilisateur est dans son salon. Des nuages passent devant le soleil,
    créant des variations rapides de luminosité. Le système doit:
    - Allumer les lumières quand il fait sombre
    - Éteindre les lumières quand il fait clair
    - Ne pas osciller rapidement (grâce aux cooldowns)
    """

    @pytest.mark.asyncio
    async def test_cloudy_day_prevents_light_oscillation(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test qu'une journée nuageuse ne cause pas d'oscillation des lumières."""
        # Setup: Mock switch state to enable feature
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Mock condition evaluator
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # État initial: Clair (500 lux)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 500}
        )

        await rule_engine.async_initialize()

        event = MagicMock()
        event.data = {"entity_id": "sensor.living_room_illuminance"}

        # T+0s: Un nuage passe → sombre (5 lux) → lumières ON
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 5}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "living_room_env_enter" in rule_engine._last_triggered
        enter_time = rule_engine._last_triggered["living_room_env_enter"]

        # Reset counter
        rule_engine.action_executor.execute_actions.reset_mock()

        # T+10s: Le nuage part → clair (500 lux) → lumières OFF
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 500}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "living_room_env_exit" in rule_engine._last_triggered
        exit_time = rule_engine._last_triggered["living_room_env_exit"]

        # Reset counter
        rule_engine.action_executor.execute_actions.reset_mock()

        # T+20s: Un autre nuage passe → sombre (5 lux)
        # ❌ BLOQUÉ par cooldown enter (< 5 minutes depuis T+0s)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 5}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Les lumières ne doivent PAS se rallumer (cooldown enter actif)
        rule_engine.action_executor.execute_actions.assert_not_called()

        # T+30s: Le nuage part → clair (500 lux)
        # ❌ BLOQUÉ par cooldown exit (< 5 minutes depuis T+10s)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 500}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Les lumières ne doivent PAS s'éteindre à nouveau (cooldown exit actif)
        rule_engine.action_executor.execute_actions.assert_not_called()

        # Vérifier que les timestamps de cooldown n'ont pas changé
        assert rule_engine._last_triggered["living_room_env_enter"] == enter_time
        assert rule_engine._last_triggered["living_room_env_exit"] == exit_time


class TestUserScenarioTwilight:
    """
    Scénario: Transition crépusculaire graduelle.

    L'utilisateur est dans son salon pendant le crépuscule. La luminosité
    diminue progressivement. Le système doit allumer les lumières au bon
    moment et ne pas osciller.
    """

    @pytest.mark.asyncio
    async def test_twilight_gradual_transition(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test la transition crépusculaire graduelle."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # 18h00: Encore clair (150 lux)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 150}
        )

        await rule_engine.async_initialize()

        event = MagicMock()
        event.data = {"entity_id": "sensor.living_room_illuminance"}

        # 18h15: Diminution progressive (80 lux) - encore au-dessus du seuil
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 80}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Pas d'action (pas encore assez sombre)
        rule_engine.action_executor.execute_actions.assert_not_called()

        # 18h30: Passage du seuil (5 lux) → lumières ON
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 5}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "living_room_env_enter" in rule_engine._last_triggered

        # 18h35: Continue à diminuer (2 lux) - toujours sombre
        rule_engine.action_executor.execute_actions.reset_mock()
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 2}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Pas d'action (pas de transition, toujours sombre)
        rule_engine.action_executor.execute_actions.assert_not_called()


class TestUserScenarioDailyUsage:
    """
    Scénario: Utilisation quotidienne normale (matin → soir).

    Simule une journée complète avec transitions naturelles:
    - Matin: Lumières s'éteignent quand il fait jour
    - Journée: Lumières restent éteintes
    - Soir: Lumières s'allument quand il fait nuit
    """

    @pytest.mark.asyncio
    async def test_full_day_cycle(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test un cycle complet jour/nuit."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # 07h00: Nuit → lumières devraient être allumées (simulé par état initial)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 2}
        )

        await rule_engine.async_initialize()

        event = MagicMock()
        event.data = {"entity_id": "sensor.living_room_illuminance"}

        # 08h00: Lever du soleil → clair (300 lux) → lumières OFF
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 300}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "living_room_env_exit" in rule_engine._last_triggered
        rule_engine._last_triggered["living_room_env_exit"]

        # 12h00: Plein jour (1000 lux) - pas de changement
        rule_engine.action_executor.execute_actions.reset_mock()
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 1000}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Pas d'action (toujours clair, pas de transition)
        rule_engine.action_executor.execute_actions.assert_not_called()

        # 19h00: Coucher du soleil → sombre (5 lux) → lumières ON
        # Le cooldown exit de 08h00 est expiré (> 5 minutes)
        rule_engine._last_triggered["living_room_env_exit"] = (
            dt_util.utcnow() - timedelta(hours=11)
        )

        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 5}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "living_room_env_enter" in rule_engine._last_triggered


class TestUserScenarioSunnyDayWithClouds:
    """
    Scénario: Journée ensoleillée avec nuages passagers.

    L'utilisateur est dans son salon par une belle journée. Quelques nuages
    passent mais ne sont pas assez opaques pour déclencher l'éclairage.
    Le système doit rester stable.
    """

    @pytest.mark.asyncio
    async def test_sunny_day_with_light_clouds(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test une journée ensoleillée avec nuages légers."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # 10h00: Grand soleil (800 lux)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 800}
        )

        await rule_engine.async_initialize()

        event = MagicMock()
        event.data = {"entity_id": "sensor.living_room_illuminance"}

        # 10h15: Nuage léger passe (200 lux) - toujours au-dessus du seuil
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 200}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Pas d'action (toujours assez clair)
        rule_engine.action_executor.execute_actions.assert_not_called()

        # 10h20: Retour au soleil (800 lux)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 800}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Toujours pas d'action
        rule_engine.action_executor.execute_actions.assert_not_called()

        # 10h30: Nuage plus épais (80 lux) - toujours au-dessus du seuil
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 80}
        )
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Toujours pas d'action (seuil de 50 lux pas atteint)
        rule_engine.action_executor.execute_actions.assert_not_called()

        # Vérifier qu'aucun cooldown n'a été créé
        assert "living_room_env_enter" not in rule_engine._last_triggered
        assert "living_room_env_exit" not in rule_engine._last_triggered


class TestUserScenarioRoomTransition:
    """
    Scénario: L'utilisateur se déplace entre les pièces.

    L'utilisateur passe d'une pièce à l'autre. Le système doit gérer
    les transitions d'activité (empty) correctement et ne pas interférer
    avec les cooldowns environnementaux.
    """

    @pytest.mark.asyncio
    async def test_room_to_room_movement(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test le déplacement entre pièces avec activité empty."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # État initial: Clair (jour), présence détectée
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 300}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        await rule_engine.async_initialize()

        # Transition environnementale: devient sombre → lumières ON
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 5}
        )
        event = MagicMock()
        event.data = {"entity_id": "sensor.living_room_illuminance"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "living_room_env_enter" in rule_engine._last_triggered

        # Reset
        rule_engine.action_executor.execute_actions.reset_mock()

        # L'utilisateur quitte la pièce → activité devient "empty"
        mock_activity_tracker.get_activity = MagicMock(return_value="empty")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(return_value="empty")

        # Simuler changement d'activité via presence entity
        presence_event = MagicMock()
        presence_event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(presence_event)
        await asyncio.sleep(2.5)

        # Les lumières doivent s'éteindre (action empty, pas de cooldown activity)
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Le cooldown environnemental ne doit PAS être affecté
        assert "living_room_env_enter" in rule_engine._last_triggered
        # Le cooldown d'activité est différent du cooldown environnemental
        assert "living_room_empty" in rule_engine._last_triggered


# Test de performance: Vérifier que le système reste réactif
class TestUserScenarioPerformance:
    """
    Scénario: Test de performance et réactivité.

    Valide que le système reste réactif même avec des changements
    environnementaux fréquents.
    """

    @pytest.mark.asyncio
    async def test_system_remains_responsive(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test que le système reste réactif avec beaucoup d'événements."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # État initial
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 500}
        )

        await rule_engine.async_initialize()

        event = MagicMock()
        event.data = {"entity_id": "sensor.living_room_illuminance"}

        # Simuler 10 changements rapides de luminosité
        for i in range(10):
            lux = 500 if i % 2 == 0 else 5
            is_dark = lux < 50

            mock_area_manager.get_area_environmental_state = MagicMock(
                return_value={"is_dark": is_dark, "illuminance": lux}
            )

            rule_engine._async_state_change_handler(event)
            await asyncio.sleep(0.1)  # Très rapide

        # Attendre que tous les debounces se terminent
        await asyncio.sleep(3)

        # Le système doit avoir traité les événements sans crasher
        # Seules les vraies transitions doivent déclencher des actions
        # (les cooldowns doivent avoir empêché l'oscillation)
        assert rule_engine.action_executor.execute_actions.call_count <= 2

        # Vérifier que le système est toujours fonctionnel
        # Le fait que des actions ont été exécutées prouve que le système fonctionne
        assert len(rule_engine._listeners.get("living_room", [])) > 0
        assert len(rule_engine._assignments) > 0
