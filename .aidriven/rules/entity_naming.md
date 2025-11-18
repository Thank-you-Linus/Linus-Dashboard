# Entity Naming and Translation Conventions

## Rule: All entity_ids must be in English, all UI text must be translatable

**Rationale**: Home Assistant entity IDs are system identifiers used in automations, scripts, and API calls. They should be:
- **Stable** across language changes
- **Portable** when shared with other users
- **Consistent** with the Home Assistant ecosystem standard

**Implementation**:

### 1. Entity IDs (unique_id)
- MUST be in English
- Use snake_case: `sensor.linus_brain_last_sync`
- Never include translated words: ❌ `sensor.linus_brain_derniere_synchronisation`

### 2. Entity Names (displayed in UI)
- **MANDATORY**: Use `_attr_translation_key` + `_attr_has_entity_name = True`
- Translation keys point to entries in `translations/en.json` and `translations/fr.json`
- **NEVER** use `_attr_name` with hardcoded strings (except for dynamic placeholders)
- **DO NOT** hardcode `_attr_native_unit_of_measurement` - use translation files instead

### 3. Translation Files

**File structure for entity names:**
```json
{
  "entity": {
    "sensor": {
      "last_sync": {
        "name": "Last Sync"  // English (en.json)
        "name": "Dernière synchronisation"  // French (fr.json)
      }
    }
  }
}
```

**File structure for units of measurement:**
```json
{
  "entity": {
    "sensor": {
      "monitored_areas": {
        "name": "Monitored Areas",
        "unit_of_measurement": "areas"  // English (en.json)
        // OR in fr.json:
        "name": "Zones surveillées",
        "unit_of_measurement": "zones"  // French (fr.json)
      }
    }
  }
}
```

**File structure for entity states (ENUM sensors):**
```json
{
  "entity": {
    "sensor": {
      "activity": {
        "name": "Activity {area_name}",
        "state": {
          "empty": "Empty",      // en.json
          "movement": "Movement",
          "occupied": "Occupied",
          "inactive": "Inactive"
        }
      }
    }
  }
}
```

### Examples

#### ✅ CORRECT: Sensor with translation
```python
class LinusBrainSyncSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_translation_key = "last_sync"
        self._attr_has_entity_name = True
        self._attr_unique_id = f"{DOMAIN}_last_sync"
```

Result:
- entity_id: `sensor.linus_brain_last_sync` (stable, English)
- UI name (EN): "Last Sync"
- UI name (FR): "Dernière synchronisation"

#### ❌ INCORRECT: Hardcoded French name
```python
class LinusBrainSyncSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_name = "Dernière synchronisation"  # DON'T DO THIS
        self._attr_unique_id = f"{DOMAIN}_derniere_synchronisation"  # DON'T DO THIS
```

### Dynamic Content (Placeholders)

For entities with dynamic content (e.g., per-area sensors, per-app sensors), use **translation_placeholders**:

```python
# Area activity sensor
self._attr_translation_key = "activity"
self._attr_translation_placeholders = {"area_name": area_name}
self._attr_unique_id = f"{DOMAIN}_activity_{area_id}"
```

Translation files support placeholders:
```json
{
  "entity": {
    "sensor": {
      "activity": {
        "name": "Activity {area_name}"  // en.json
        "name": "Activité {area_name}"  // fr.json
      }
    }
  }
}
```

### Entity Categories

All non-user-facing entities MUST use `EntityCategory.DIAGNOSTIC` (not CONFIG):

```python
self._attr_entity_category = EntityCategory.DIAGNOSTIC
```

**Why?** Sensors can only be `DIAGNOSTIC` or `None`. Using `CONFIG` causes Home Assistant errors.

## Translation Requirements - MANDATORY CHECKLIST

### For ALL new entities:

1. **Entity Definition (Python code)**:
   - [ ] `_attr_unique_id` uses English snake_case
   - [ ] `_attr_translation_key` is set (REQUIRED - not optional)
   - [ ] `_attr_has_entity_name = True` is set
   - [ ] `_attr_name` is NOT used (removed/never added)
   - [ ] For ENUM sensors: `_attr_device_class = SensorDeviceClass.ENUM` is set
   - [ ] For ENUM sensors: `_attr_options` list is defined
   - [ ] Entity category is `DIAGNOSTIC` or `None` (NOT `CONFIG` for sensors)

2. **Translation Files**:
   - [ ] Translation added to `translations/en.json` under `entity.{platform}.{translation_key}.name`
   - [ ] Translation added to `translations/fr.json` under `entity.{platform}.{translation_key}.name`
   - [ ] If sensor has `native_unit_of_measurement`: Remove it from Python code
   - [ ] If sensor needs unit translation: Add `unit_of_measurement` key in both translation files
   - [ ] If ENUM sensor: Add `state` translations in both files for all options

3. **Testing**:
   - [ ] Add test to verify `translation_key` is set
   - [ ] Add test to verify `has_entity_name = True`
   - [ ] Add test to verify translation exists in `en.json`
   - [ ] Add test to verify translation exists in `fr.json`
   - [ ] If sensor has unit: Add test to verify unit translation exists in both files
   - [ ] If ENUM sensor: Add test to verify all state translations exist

## Examples

### ✅ CORRECT: Sensor with name translation
```python
class LinusBrainSyncSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_translation_key = "last_sync"
        self._attr_has_entity_name = True
        self._attr_unique_id = f"{DOMAIN}_last_sync"
```

Result:
- entity_id: `sensor.linus_brain_last_sync` (stable, English)
- UI name (EN): "Linus Brain Last Sync"
- UI name (FR): "Linus Brain Dernière synchro"

### ✅ CORRECT: Sensor with unit of measurement translation
```python
class LinusBrainRoomsSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_translation_key = "monitored_areas"
        self._attr_has_entity_name = True
        self._attr_unique_id = f"{DOMAIN}_monitored_areas"
        # DO NOT set _attr_native_unit_of_measurement here!
```

In `en.json`:
```json
{
  "entity": {
    "sensor": {
      "monitored_areas": {
        "name": "Monitored Areas",
        "unit_of_measurement": "areas"
      }
    }
  }
}
```

In `fr.json`:
```json
{
  "entity": {
    "sensor": {
      "monitored_areas": {
        "name": "Zones surveillées",
        "unit_of_measurement": "zones"
      }
    }
  }
}
```

Result:
- entity_id: `sensor.linus_brain_monitored_areas`
- UI state (EN): "5 areas"
- UI state (FR): "5 zones"

### ✅ CORRECT: ENUM sensor with state translations
```python
class LinusAreaContextSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_translation_key = "activity"
        self._attr_has_entity_name = True
        self._attr_translation_placeholders = {"area_name": area_name}
        self._attr_device_class = SensorDeviceClass.ENUM
        self._attr_options = ["empty", "movement", "occupied", "inactive"]
        self._attr_unique_id = f"{DOMAIN}_activity_{area_id}"
```

In translation files:
```json
{
  "entity": {
    "sensor": {
      "activity": {
        "name": "Activity {area_name}",  // or "Activité {area_name}" in fr.json
        "state": {
          "empty": "Empty",      // or "Vide" in fr.json
          "movement": "Movement", // or "Mouvement" in fr.json
          "occupied": "Occupied", // or "Occupé" in fr.json
          "inactive": "Inactive"  // or "Inactif" in fr.json
        }
      }
    }
  }
}
```

### ❌ INCORRECT: Hardcoded name
```python
class LinusBrainSyncSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_name = "Last Sync"  # DON'T DO THIS
        self._attr_unique_id = f"{DOMAIN}_last_sync"
```

### ❌ INCORRECT: Hardcoded unit of measurement
```python
class LinusBrainRoomsSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_translation_key = "monitored_areas"
        self._attr_native_unit_of_measurement = "areas"  # DON'T DO THIS - use translation files!
```

### ❌ INCORRECT: Missing has_entity_name
```python
class LinusBrainSyncSensor(SensorEntity):
    def __init__(self, ...):
        self._attr_translation_key = "last_sync"
        # Missing: self._attr_has_entity_name = True
```
