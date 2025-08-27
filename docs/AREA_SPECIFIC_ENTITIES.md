# Entités Spécifiques par Area

## Nouvelle fonctionnalité : temperature_entity_id et humidity_entity_id

Depuis la version récente de Home Assistant, il est possible d'attacher des entités spécifiques de température et d'humidité à chaque area via les propriétés `temperature_entity_id` et `humidity_entity_id`.

### Fonctionnement

Le Linus Dashboard prend maintenant en charge ces entités spécifiques avec la logique de priorité suivante :

1. **Magic Area** : Si une Magic Area existe pour l'area, elle est utilisée en priorité
2. **Entité spécifique** : Si `temperature_entity_id` ou `humidity_entity_id` est défini pour l'area, cette entité est utilisée
3. **Fallback** : Sinon, toutes les entités de température/humidité de l'area sont utilisées (comportement précédent)

### Méthodes modifiées

Les méthodes suivantes ont été mises à jour pour prendre en charge cette fonctionnalité :

- `Helper.getSensorStateTemplate()` : Utilise l'entité spécifique si définie
- `Helper.getStates()` : Prend en compte les entités spécifiques dans la logique de récupération des états
- `Helper.getEntityIds()` : Inclut les entités spécifiques dans la liste des IDs d'entités
- `Helper.getAreaEntities()` : Retourne l'entité spécifique si définie pour le device_class correspondant

### Exemple d'utilisation

```typescript
// Si l'area "salon" a une temperature_entity_id définie
const area = Helper.areas["salon"];
// area.temperature_entity_id = "sensor.salon_temperature_specific"

// Cette méthode utilisera maintenant l'entité spécifique
const temperatureTemplate = Helper.getSensorStateTemplate("temperature", "salon");

// Au lieu d'utiliser toutes les entités temperature du salon,
// elle utilisera uniquement "sensor.salon_temperature_specific"
```

### Structure des types

La propriété `AreaRegistryEntry` a été étendue pour inclure :

```typescript
interface AreaRegistryEntry {
  // ... propriétés existantes
  temperature_entity_id?: string;
  humidity_entity_id?: string;
}
```

### Configuration Home Assistant

Pour utiliser cette fonctionnalité, configurez vos areas dans Home Assistant avec les entités spécifiques :

```yaml
# Exemple de configuration d'area avec entité spécifique
area:
  - name: "Salon"
    temperature_entity_id: "sensor.salon_temperature_precise"
    humidity_entity_id: "sensor.salon_humidity_precise"
```

Cette approche permet d'avoir un contrôle plus précis sur quelles entités représentent la température et l'humidité de chaque pièce, particulièrement utile quand plusieurs capteurs sont présents dans la même area.
