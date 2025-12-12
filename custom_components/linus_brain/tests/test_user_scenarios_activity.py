"""
Tests de scénarios utilisateur pour le système d'éclairage automatique basé sur l'activité.

Ces tests simulent des scénarios réels d'utilisation quotidienne pour valider
le comportement du système d'éclairage automatique avec les transitions d'activité
(movement, empty, etc.) du point de vue de l'utilisateur.

Scénarios testés:
1. Arrivée à la maison le soir (empty → movement dans le noir)
2. Réveil matinal (movement dans différentes pièces)
3. Film au salon (watching_tv avec lumières tamisées)
4. Travail à domicile (working avec éclairage constant)
5. Départ de la maison (toutes les lumières s'éteignent)
6. Nuit complète sans mouvement
7. Invités à la maison (multiple mouvements simultanés)
8. Cuisine le soir (cooking avec éclairage spécifique)
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

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
    """Mock ActivityTracker."""
    tracker = MagicMock()
    tracker.async_initialize = AsyncMock()
    tracker.async_evaluate_activity = AsyncMock(return_value="empty")
    tracker.get_activity = MagicMock(return_value="empty")
    return tracker


@pytest.fixture
def mock_area_manager():
    """Mock AreaManager."""
    manager = MagicMock()

    def get_area_entities(area_id, domain=None, device_class=None):
        if domain == "sensor" and device_class == "illuminance":
            return [f"sensor.{area_id}_illuminance"]
        if domain == "binary_sensor" and device_class == "motion":
            return [f"binary_sensor.{area_id}_motion"]
        return []

    manager.get_area_entities = MagicMock(side_effect=get_area_entities)
    manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )
    return manager


@pytest.fixture
def mock_app_storage():
    """Mock AppStorage with automatic lighting app."""
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
            "watching_tv": {
                "conditions": [],
                "actions": [
                    {
                        "service": "light.turn_on",
                        "domain": "light",
                        "area": "current",
                        "data": {"brightness_pct": 20},
                    }
                ],
                "logic": "and",
            },
            "working": {
                "conditions": [],
                "actions": [
                    {
                        "service": "light.turn_on",
                        "domain": "light",
                        "area": "current",
                        "data": {"brightness_pct": 100, "color_temp": 350},
                    }
                ],
                "logic": "and",
            },
            "cooking": {
                "conditions": [],
                "actions": [
                    {
                        "service": "light.turn_on",
                        "domain": "light",
                        "area": "current",
                        "data": {"brightness_pct": 100},
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
    storage.async_save = AsyncMock(return_value=True)
    return storage


@pytest.fixture
def rule_engine(mock_hass, mock_activity_tracker, mock_area_manager, mock_app_storage):
    """Create RuleEngine with mocked dependencies."""
    from ..utils.action_executor import ActionExecutor
    from ..utils.condition_evaluator import ConditionEvaluator

    engine = RuleEngine(
        hass=mock_hass,
        entry_id="test_entry",
        activity_tracker=mock_activity_tracker,
        area_manager=mock_area_manager,
        app_storage=mock_app_storage,
    )

    # Mock internal components
    engine.condition_evaluator = ConditionEvaluator(mock_hass, mock_area_manager)
    engine.action_executor = ActionExecutor(mock_hass, mock_area_manager)

    return engine


class TestUserScenarioHomeArrivalEvening:
    """
    Scénario: Arrivée à la maison le soir.

    L'utilisateur rentre chez lui le soir, il fait sombre.
    Les lumières doivent s'allumer automatiquement quand il entre.
    """

    @pytest.mark.asyncio
    async def test_home_arrival_lights_turn_on(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test que les lumières s'allument quand on arrive le soir."""
        # Setup: Feature enabled
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

        # État initial: Maison vide, sombre (19h00)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 3}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="empty")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(return_value="empty")

        await rule_engine.async_initialize()

        # L'utilisateur arrive: empty → movement
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )

        event = MagicMock()
        event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Les lumières doivent s'allumer
        assert rule_engine.action_executor.execute_actions.call_count == 1
        call_args = rule_engine.action_executor.execute_actions.call_args
        actions = call_args[0][0]
        assert actions[0]["service"] == "light.turn_on"
        assert actions[0]["data"]["brightness_pct"] == 100


class TestUserScenarioMorningRoutine:
    """
    Scénario: Routine matinale.

    L'utilisateur se réveille, se déplace dans différentes pièces (chambre → salle de bain → cuisine).
    Il fait encore sombre au début, puis le soleil se lève.
    """

    @pytest.mark.asyncio
    async def test_morning_routine_with_sunrise(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test la routine matinale avec lever du soleil."""
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

        # 06h00: Réveil, sombre
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 1}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )

        await rule_engine.async_initialize()

        # Premier mouvement: lumières ON
        event = MagicMock()
        event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Reset pour la suite
        rule_engine.action_executor.execute_actions.reset_mock()

        # 06h30: Le soleil se lève graduellement (devient clair)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 150}
        )

        env_event = MagicMock()
        env_event.data = {"entity_id": "sensor.living_room_illuminance"}
        rule_engine._async_state_change_handler(env_event)
        await asyncio.sleep(2.5)

        # Les lumières doivent s'éteindre (on_exit: became_bright)
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Mouvement continu mais lumières restent éteintes (il fait jour)
        rule_engine.action_executor.execute_actions.reset_mock()
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Pas d'action car conditions non remplies (pas sombre)
        assert rule_engine.action_executor.execute_actions.call_count == 0


class TestUserScenarioWatchingTV:
    """
    Scénario: Regarder la TV le soir.

    L'utilisateur s'installe pour regarder la TV. L'activité change
    de "movement" à "watching_tv" et les lumières doivent se tamiser.
    """

    @pytest.mark.asyncio
    async def test_tv_watching_dims_lights(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test que les lumières se tamisent quand on regarde la TV."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        async def mock_conditions(conditions, area_id, logic):
            # watching_tv n'a pas de conditions
            return True

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # État initial: mouvement, lumières à 100%
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 5}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        await rule_engine.async_initialize()

        # Allumer les lumières (movement)
        event = MagicMock()
        event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Reset
        rule_engine.action_executor.execute_actions.reset_mock()

        # L'utilisateur commence à regarder la TV: movement → watching_tv
        mock_activity_tracker.get_activity = MagicMock(return_value="watching_tv")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="watching_tv"
        )

        # Simuler détection d'activité TV (peut être un media_player state change)
        tv_event = MagicMock()
        tv_event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(tv_event)
        await asyncio.sleep(2.5)

        # Les lumières doivent se tamiser (brightness 20%)
        assert rule_engine.action_executor.execute_actions.call_count == 1
        call_args = rule_engine.action_executor.execute_actions.call_args
        actions = call_args[0][0]
        assert actions[0]["service"] == "light.turn_on"
        assert actions[0]["data"]["brightness_pct"] == 20


class TestUserScenarioWorkFromHome:
    """
    Scénario: Travail à domicile.

    L'utilisateur travaille depuis la maison. L'activité "working"
    doit maintenir un éclairage constant et optimal (luminosité 100%, température de couleur froide).
    """

    @pytest.mark.asyncio
    async def test_working_maintains_bright_cool_light(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test que l'éclairage reste optimal pendant le travail."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            return_value=True
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # État initial: empty
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False, "illuminance": 200}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="empty")

        await rule_engine.async_initialize()

        # L'utilisateur commence à travailler: empty → working
        mock_activity_tracker.get_activity = MagicMock(return_value="working")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="working"
        )

        event = MagicMock()
        event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Les lumières doivent s'allumer avec paramètres optimaux
        assert rule_engine.action_executor.execute_actions.call_count == 1
        call_args = rule_engine.action_executor.execute_actions.call_args
        actions = call_args[0][0]
        assert actions[0]["service"] == "light.turn_on"
        assert actions[0]["data"]["brightness_pct"] == 100
        assert actions[0]["data"]["color_temp"] == 350  # Lumière froide


class TestUserScenarioLeavingHome:
    """
    Scénario: Départ de la maison.

    L'utilisateur quitte la maison. Toutes les activités passent à "empty"
    et toutes les lumières doivent s'éteindre.
    """

    @pytest.mark.asyncio
    async def test_leaving_home_turns_off_all_lights(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test que toutes les lumières s'éteignent au départ."""
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

        # État initial: présence détectée, lumières allumées
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 5}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )

        await rule_engine.async_initialize()

        # Allumer les lumières (movement + dark)
        event = MagicMock()
        event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        assert rule_engine.action_executor.execute_actions.call_count == 1
        call_args = rule_engine.action_executor.execute_actions.call_args
        actions = call_args[0][0]
        assert actions[0]["service"] == "light.turn_on"

        # Reset
        rule_engine.action_executor.execute_actions.reset_mock()

        # L'utilisateur part: movement → empty
        mock_activity_tracker.get_activity = MagicMock(return_value="empty")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(return_value="empty")

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Les lumières doivent s'éteindre
        assert rule_engine.action_executor.execute_actions.call_count == 1
        call_args = rule_engine.action_executor.execute_actions.call_args
        actions = call_args[0][0]
        assert actions[0]["service"] == "light.turn_off"


class TestUserScenarioOvernightNoMovement:
    """
    Scénario: Nuit complète sans mouvement.

    Pendant la nuit, aucun mouvement n'est détecté pendant plusieurs heures.
    Le système ne doit pas générer d'actions inutiles.
    """

    @pytest.mark.asyncio
    async def test_overnight_no_unnecessary_actions(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test qu'aucune action inutile n'est générée pendant la nuit."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            return_value=False
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # État initial: empty, sombre
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 0}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="empty")

        await rule_engine.async_initialize()

        # Simuler plusieurs heures sans mouvement (pas d'événements)
        await asyncio.sleep(0.5)

        # Aucune action ne doit être exécutée
        assert rule_engine.action_executor.execute_actions.call_count == 0

        # Vérifier que le système est toujours réactif après inactivité
        assert len(rule_engine._assignments) > 0


class TestUserScenarioGuestsAtHome:
    """
    Scénario: Invités à la maison.

    Plusieurs personnes se déplacent dans différentes zones.
    Le système doit gérer correctement les mouvements multiples et simultanés.
    """

    @pytest.mark.asyncio
    async def test_multiple_movements_handled_correctly(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test que les mouvements multiples sont gérés correctement."""
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

        # État initial: sombre, soirée
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 8}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        await rule_engine.async_initialize()

        # Premier mouvement: lumières ON
        event = MagicMock()
        event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        first_call_count = rule_engine.action_executor.execute_actions.call_count
        assert first_call_count >= 1

        # Mouvements répétés (invités qui se déplacent)
        for _ in range(5):
            rule_engine._async_state_change_handler(event)
            await asyncio.sleep(0.3)

        # Attendre que le debounce se termine
        await asyncio.sleep(2.5)

        # Le nombre d'actions doit rester raisonnable (debounce empêche les actions répétées)
        # On s'attend à 1-2 actions max, pas 6
        assert (
            rule_engine.action_executor.execute_actions.call_count
            <= first_call_count + 1
        )


class TestUserScenarioCookingEvening:
    """
    Scénario: Préparation du repas le soir.

    L'utilisateur prépare le repas dans la cuisine. L'activité "cooking"
    doit maintenir un éclairage optimal pendant toute la durée de la préparation.
    """

    @pytest.mark.asyncio
    async def test_cooking_maintains_bright_light(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test que l'éclairage reste optimal pendant la cuisine."""
        # Setup
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            return_value=True
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # État initial: mouvement général
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True, "illuminance": 10}
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        await rule_engine.async_initialize()

        # Lumières allumées (movement)
        event = MagicMock()
        event.data = {"entity_id": "binary_sensor.living_room_motion"}
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Reset
        rule_engine.action_executor.execute_actions.reset_mock()

        # L'utilisateur commence à cuisiner: movement → cooking
        mock_activity_tracker.get_activity = MagicMock(return_value="cooking")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="cooking"
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Les lumières doivent rester/passer à 100%
        assert rule_engine.action_executor.execute_actions.call_count == 1
        call_args = rule_engine.action_executor.execute_actions.call_args
        actions = call_args[0][0]
        assert actions[0]["service"] == "light.turn_on"
        assert actions[0]["data"]["brightness_pct"] == 100

        # Vérifier que l'activité cooking est bien enregistrée
        assert "living_room_cooking" in rule_engine._last_triggered
