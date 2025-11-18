# 🌐 Translation Rules

> **Purpose**: Ensure all user-facing UI elements have proper translations  
> **Applies to**: All code that adds config flows, options flows, services, and UI elements

---

## 📋 Core Principle

**Every user-facing UI element MUST have translations in ALL supported languages.**

Currently supported languages:
- English (`en.json`)
- French (`fr.json`)

---

## 🔤 When Translations Are Required

### Config Flow & Options Flow

When adding fields to `config_flow.py`, you MUST add translations for:

1. **Field Labels** - in `data` section
2. **Field Descriptions** - in `data_description` section
3. **Error Messages** - in `error` section
4. **Step Titles** - in `step.{step_name}.title`
5. **Step Descriptions** - in `step.{step_name}.description`

### Services

When adding services in `services.yaml`, you MUST translate:

1. **Service Name** - `name` field
2. **Service Description** - `description` field
3. **Field Names** - `fields.{field_name}.name`
4. **Field Descriptions** - `fields.{field_name}.description`

### Entities

When creating new entity types, you MUST translate:

1. **Entity Names** - in `entity.{platform}.{entity_key}.name`
2. **State Values** - in `entity.{platform}.{entity_key}.state.{state_value}`
3. **Unit of Measurement** - in `entity.{platform}.{entity_key}.unit_of_measurement`

---

## 📝 Translation File Structure

### Config Flow Example

```json
{
  "config": {
    "step": {
      "user": {
        "title": "Configure Integration",
        "description": "Enter your settings",
        "data": {
          "field_name": "Field Label",
          "another_field": "Another Field Label"
        },
        "data_description": {
          "field_name": "Description explaining what this field does (min-max, default, etc.)",
          "another_field": "Description of another field"
        }
      }
    },
    "error": {
      "cannot_connect": "Connection failed",
      "invalid_value": "Invalid value provided"
    }
  },
  "options": {
    "step": {
      "init": {
        "title": "Integration Options",
        "description": "Configure advanced settings",
        "data": {
          "option_name": "Option Label"
        },
        "data_description": {
          "option_name": "Detailed description of option"
        }
      }
    }
  }
}
```

---

## ✅ Translation Best Practices

### 1. Always Update Both Languages

When adding a UI element, update translations in **parallel**:

```python
# WRONG - Only adding to en.json
✗ Added field to config_flow.py
✗ Updated en.json
✗ Forgot fr.json

# CORRECT - Both languages updated
✓ Added field to config_flow.py
✓ Updated en.json
✓ Updated fr.json
```

### 2. Provide Meaningful Descriptions

Include helpful context in descriptions:

```json
{
  "data_description": {
    "dark_lux_threshold": "Lux threshold below which an area is considered dark (0-1000 lux, default: 20). Acts as fallback for areas without AI insights."
  }
}
```

**Good description includes:**
- What the field does
- Valid range (min-max)
- Default value
- How it relates to other features

### 3. Match Config Flow Field Names

Translation keys MUST match the field names in your config schema:

```python
# In config_flow.py
vol.Optional(CONF_DARK_LUX_THRESHOLD): vol.All(...)

# In translations/en.json
"data": {
  "dark_lux_threshold": "Dark Lux Threshold"  # Matches CONF_DARK_LUX_THRESHOLD
}
```

### 4. Keep French Translations Professional

- Use formal "vous" form unless integration is casual
- Keep technical terms in English when appropriate
- Ensure French translations are natural, not word-for-word

### 5. Description Placeholders for Priority Logic

When a config value serves as a fallback, make it clear:

```json
{
  "en": {
    "data_description": {
      "inactive_timeout": "Time in seconds before area becomes inactive (1-3600s, default: 60). Cloud values override this."
    }
  },
  "fr": {
    "data_description": {
      "inactive_timeout": "Durée en secondes avant qu'une zone devient inactive (1-3600s, défaut: 60). Les valeurs cloud remplacent ceci."
    }
  }
}
```

---

## 🔧 Implementation Checklist

When adding new UI elements, follow this checklist:

- [ ] Add field to `config_flow.py` or `services.yaml`
- [ ] Add translation keys to `translations/en.json`
- [ ] Add translation keys to `translations/fr.json`
- [ ] Ensure both files are valid JSON (use `python3 -m json.tool`)
- [ ] Verify field names match between code and translations
- [ ] Include descriptions with ranges, defaults, and context
- [ ] Test UI to ensure translations appear correctly

---

## 🚨 Common Mistakes

### 1. Missing `data_description`

❌ Bad:
```json
{
  "data": {
    "timeout": "Timeout"
  }
}
```

✅ Good:
```json
{
  "data": {
    "timeout": "Timeout"
  },
  "data_description": {
    "timeout": "Duration in seconds before timeout occurs (1-3600, default: 60)"
  }
}
```

### 2. Inconsistent Key Names

❌ Bad:
```python
# config_flow.py
CONF_DARK_THRESHOLD = "dark_lux_threshold"

# en.json
"data": {
  "dark_threshold": "Dark Threshold"  # Doesn't match!
}
```

✅ Good:
```python
# config_flow.py
CONF_DARK_THRESHOLD = "dark_lux_threshold"

# en.json
"data": {
  "dark_lux_threshold": "Dark Threshold"  # Matches constant
}
```

### 3. Forgetting Second Language

❌ Bad:
```bash
# Only one language updated
git diff
+ translations/en.json | 10 new lines
```

✅ Good:
```bash
# Both languages updated
git diff
+ translations/en.json | 10 new lines
+ translations/fr.json | 10 new lines
```

---

## 🧪 Testing Translations

### Validate JSON Syntax

```bash
python3 -m json.tool translations/en.json > /dev/null && echo "✓ en.json valid"
python3 -m json.tool translations/fr.json > /dev/null && echo "✓ fr.json valid"
```

### Check for Missing Keys

Ensure both translation files have the same structure:

```python
import json

with open("translations/en.json") as f:
    en_keys = set(json.load(f).keys())

with open("translations/fr.json") as f:
    fr_keys = set(json.load(f).keys())

missing_in_fr = en_keys - fr_keys
missing_in_en = fr_keys - en_keys

if missing_in_fr or missing_in_en:
    print("❌ Translation mismatch detected!")
```

---

## 📚 Resources

- [Home Assistant Translation Documentation](https://developers.home-assistant.io/docs/internationalization/)
- [Translation File Format](https://developers.home-assistant.io/docs/internationalization/core/)

---

**Always provide translations in ALL supported languages when adding UI elements. This ensures a consistent experience for all users.**
