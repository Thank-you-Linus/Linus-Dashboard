# Chip System Architecture

> **Last updated**: December 22, 2024  
> **Related commits**: 3b04c08, 8cc9d43

---

## 📋 Overview

The **Chip System** in Linus Dashboard provides compact, interactive controls that appear next to titles throughout the interface. Chips allow users to quickly control groups of entities (e.g., "turn on all lights in living room") without opening detailed views.

### Key Concepts

- **Chips**: Small interactive buttons with icons, colors, and optional content (e.g., entity count)
- **Control Chips**: Domain-specific chips that control groups of entities (lights, covers, fans, etc.)
- **Aggregate Chips**: Special chips that aggregate multiple entities and show counts
- **Global Chips**: Chips that control ALL entities of a domain across the entire home
- **Floor Chips**: Chips that control all entities of a domain on a specific floor
- **Area Chips**: Chips that control all entities of a domain in a specific area

---

## 🏗️ Architecture Overview

### Three-Level Control Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOMAIN VIEW                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Global Badges: [🔄 Refresh] [💡 All Lights (12)]      │   │ ← LEVEL 1: Global
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🏢 First Floor [💡] [🌡️] [🎭]                         │   │ ← LEVEL 2: Floor
│  │                                                          │   │
│  │    ┌─────────────────────────────────────────────────┐  │   │
│  │    │ 🛏️ Bedroom [💡 Lights] [🌡️ Climate]          │  │   │ ← LEVEL 3: Area
│  │    │ [Entity Cards...]                              │  │   │
│  │    └─────────────────────────────────────────────────┘  │   │
│  │                                                          │   │
│  │    ┌─────────────────────────────────────────────────┐  │   │
│  │    │ 🛁 Bathroom [💡 Lights]                        │  │   │
│  │    │ [Entity Cards...]                              │  │   │
│  │    └─────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Display Locations

1. **View Badges** (top-right of views):
   - Global control chips (control all entities of domain)
   - Refresh chip (always centered)

2. **Floor Title Cards** (section headers):
   - Floor-level control chips
   - Control all entities of domain on that floor

3. **Area Title Cards** (subsection headers):
   - Area-level control chips
   - Control all entities of domain in that area

---

## 🔧 Core Components

### 1. AggregateChip (`src/chips/AggregateChip.ts`)

**Purpose**: Unified chip system for controlling groups of entities.

**Key Features**:
- Supports all domains (light, climate, cover, fan, switch, etc.)
- Handles device_class filtering for aggregate domains
- Shows entity count when `show_content: true`
- Opens specialized popups on tap
- Color-coded by domain and state

**Constructor Parameters**:
```typescript
interface AggregateChipConfig {
  domain: string;                  // e.g., "light", "cover", "climate"
  device_class?: string;           // e.g., "blind", "curtain" (for covers)
  area_slug?: string;              // e.g., "living_room", "global"
  magic_device_id?: string;        // Magic Areas device ID
  show_content?: boolean;          // Show entity count (default: false)
  translationKey?: string;         // Custom translation key
  activeStates?: string[];         // States considered "active"
  features?: any[];                // Additional features
}
```

**Entity Resolution Logic**:
```typescript
// For AGGREGATE_DOMAINS (sensor, binary_sensor, cover)
if (device_class) {
  // Get entities WITH specific device_class
  entities = Helper.getEntityIds({ domain, device_class, area_slug });
} else {
  // Get entities WITHOUT any device_class
  entities = Helper.getEntityIds({ domain, device_class: null, area_slug });
}

// For NON-AGGREGATE domains (light, switch, fan, climate, etc.)
if (device_class === undefined) {
  // Get ALL entities (with or without device_class)
  entities = Helper.getEntityIds({ domain, area_slug });
}
```

**Scope Determination**:
```typescript
if (area_slug === "global" || area_slug === undefined) {
  // Global scope: exclude UNDISCLOSED entities
  entities = getGlobalEntitiesExceptUndisclosed(domain, device_class);
} else {
  // Area scope: get entities for specific area
  entities = Helper.getEntityIds({ domain, device_class, area_slug });
}
```

**Popup Routing**:
```typescript
// Domain-specific popups
switch(domain) {
  case "light":
    return new LightsGroupPopup(...);  // Brightness, color, etc.
  case "cover":
    return new CoverPopup(...);        // Open/close controls
  case "climate":
    return new ClimatePopup(...);      // Temperature, mode
  case "sensor":
  case "binary_sensor":
    return new AggregateListPopup(...);// Entity list
  default:
    return new AggregatePopup(...);    // Generic control popup
}
```

**Example Usage**:
```typescript
// Global light chip (all lights in home)
new AggregateChip({
  domain: "light",
  area_slug: "global",
  show_content: true,  // Shows count: "12"
});

// Bedroom light chip
new AggregateChip({
  domain: "light",
  area_slug: "bedroom",
});

// Cover chip for blinds only
new AggregateChip({
  domain: "cover",
  device_class: "blind",
  area_slug: "living_room",
});

// Cover chip for entities WITHOUT device_class
new AggregateChip({
  domain: "cover",
  device_class: null,  // Only entities without device_class
  area_slug: "living_room",
});
```

---

### 2. ControllerCard (`src/cards/ControllerCard.ts`)

**Purpose**: Generates title cards with embedded control chips.

**Key Features**:
- Creates title/subtitle cards for sections
- Conditionally adds control chips based on `showControls` option
- Supports extra controls via `extraControls` callback
- Handles navigation to domain/area views

**Constructor Parameters**:
```typescript
interface ControllerCardOptions {
  title?: string;                   // Main title
  subtitle?: string;                // Subtitle (for area names)
  titleIcon?: string;               // Icon next to title
  subtitleIcon?: string;            // Icon next to subtitle
  titleNavigate?: string;           // Navigation path for title
  subtitleNavigate?: string;        // Navigation path for subtitle
  showControls?: boolean;           // Show control chips
  extraControls?: any[];            // Additional chips
  controlChipOptions?: {
    device_class?: string;
    area_slug?: string;
  };
}
```

**Chip Generation Logic**:
```typescript
// 1. Check if showControls is enabled
if (!showControls) return [];  // No chips

// 2. Get domain configuration
const domainOptions = Helper.strategyOptions.domains[domain] || {};

// 3. Check for device_class-specific controls
if (AGGREGATE_DOMAINS.includes(domain)) {
  // For aggregate domains, device_class determines control scope
  if (device_class) {
    // Create chip for specific device_class
    chips.push(new AggregateChip({ domain, device_class, area_slug }));
  } else {
    // Create chip for entities WITHOUT device_class
    chips.push(new AggregateChip({ domain, device_class: null, area_slug }));
  }
} else {
  // For non-aggregate domains, create single chip
  chips.push(new AggregateChip({ domain, area_slug }));
}

// 4. Add extra controls (if configured)
if (domainOptions.extraControls) {
  chips.push(...domainOptions.extraControls(device));
}

return chips;
```

**Example Usage**:
```typescript
// Floor title with chips
new ControllerCard({
  title: "First Floor",
  titleIcon: "mdi:floor-plan",
  titleNavigate: "first_floor",
  showControls: true,
  controlChipOptions: {
    area_slug: "first_floor"
  }
}, "light", "first_floor");

// Area subtitle with chips
new ControllerCard({
  subtitle: "Living Room",
  subtitleIcon: "mdi:sofa",
  subtitleNavigate: "living_room",
  showControls: true,
  controlChipOptions: {
    area_slug: "living_room"
  }
}, "light", "living_room");
```

---

### 3. Helper.getEntityIds() (`src/Helper.ts`)

**Purpose**: Central entity filtering and resolution.

**Key Features**:
- Supports `device_class: null` (entities WITHOUT device_class)
- Supports `device_class: undefined` (ALL entities, with or without device_class)
- Filters by area, domain, device_class
- Excludes Magic Areas entities when needed

**Signature**:
```typescript
static getEntityIds(options: {
  domain: string;
  device_class?: string | null;  // null = without, undefined = all
  area_slug?: string;
}): string[]
```

**Logic**:
```typescript
// 1. Determine domain tag
let domainTag = domain;
if (AGGREGATE_DOMAINS.includes(domain)) {
  if (device_class === null) {
    // Only entities WITHOUT device_class
    domainTag = domain;  // e.g., "cover"
  } else if (device_class !== undefined) {
    // Only entities WITH specific device_class
    domainTag = `${domain}:${device_class}`;  // e.g., "cover:blind"
  } else {
    // ALL entities (with or without device_class)
    // Special handling: aggregate all device_class variants
  }
}

// 2. Get entities from registry
if (area_slug) {
  // Area-specific
  entities = Helper.areas[area_slug]?.domains?.[domainTag] || [];
} else {
  // Global
  entities = Helper.domains[domainTag] || [];
}

// 3. Filter for device_class: undefined (aggregate all variants)
if (AGGREGATE_DOMAINS.includes(domain) && device_class === undefined) {
  // Collect from base domain + all device_class variants
  const allEntities = [...Helper.domains[domain] || []];
  const deviceClasses = DEVICE_CLASSES[domain] || [];
  for (const dc of deviceClasses) {
    allEntities.push(...Helper.domains[`${domain}:${dc}`] || []);
  }
  entities = allEntities;
}

return entities;
```

---

### 4. getGlobalEntitiesExceptUndisclosed() (`src/utils.ts`)

**Purpose**: Get global entities while excluding UNDISCLOSED area entities.

**Key Features**:
- Handles AGGREGATE_DOMAINS with device_class variants
- Checks ALL possible device_class locations for UNDISCLOSED entities
- Ensures global chips don't include hidden/undisclosed entities

**Implementation**:
```typescript
export const getGlobalEntitiesExceptUndisclosed = memoize(function(
  domain: string,
  device_class?: string
): string[] {
  // 1. Get all entities for domain/device_class
  const domainTag = device_class ? `${domain}:${device_class}` : domain;
  const entities = device_class === undefined
    ? getAllDomainEntities(domain)  // All variants
    : Helper.domains[domainTag] ?? [];

  // 2. Filter out UNDISCLOSED entities
  return entities.filter(entity => {
    // For AGGREGATE_DOMAINS without device_class, check all variants
    if (AGGREGATE_DOMAINS.includes(domain) && !device_class) {
      // Check base domain (e.g., "cover")
      if (Helper.areas[UNDISCLOSED]?.domains?.[domain]?.includes(entity.entity_id)) {
        return false;
      }
      // Check all device_class variants (e.g., "cover:blind", "cover:curtain")
      const deviceClasses = DEVICE_CLASSES[domain] || [];
      for (const dc of deviceClasses) {
        const variantTag = `${domain}:${dc}`;
        if (Helper.areas[UNDISCLOSED]?.domains?.[variantTag]?.includes(entity.entity_id)) {
          return false;
        }
      }
      return true;
    }
    // For other cases, simple filter
    return !Helper.areas[UNDISCLOSED]?.domains?.[domainTag]?.includes(entity.entity_id);
  }).map(e => e.entity_id);
});
```

**Why This Matters**:
- Covers can have device_class ("blind", "curtain") or no device_class
- UNDISCLOSED area stores entities by their specific domainTag
- A cover without device_class is in `Helper.areas[UNDISCLOSED].domains["cover"]`
- A cover with device_class "blind" is in `Helper.areas[UNDISCLOSED].domains["cover:blind"]`
- Global chips must check ALL variants to properly exclude UNDISCLOSED entities

---

## 📍 Chip Display Rules

### Domain-Specific Rules

```typescript
// ALWAYS show chips (user-facing controls)
const DOMAINS_WITH_CHIPS = [
  "light",       // Lights (on/off, brightness)
  "climate",     // Thermostats (temperature, mode)
  "cover",       // Covers/blinds (open/close)
  "fan",         // Fans (on/off, speed)
  "switch",      // Switches (on/off)
  "media_player",// Media players (play/pause)
];

// NEVER show chips (too many device_classes)
const DOMAINS_WITHOUT_CHIPS = [
  "sensor",        // 57 device_classes
  "binary_sensor", // 24 device_classes
];
```

### Chip Disable Logic

Chips are disabled in these scenarios:

1. **Sensor/Binary Sensor Domains**:
   ```typescript
   // In utils.ts processFloorsAndAreas()
   if (domain === "sensor" || domain === "binary_sensor") {
     titleCardOptions.showControls = false;
   }
   ```
   **Reason**: Too many device_classes (57 for sensor, 24 for binary_sensor) would create UI clutter

2. **UNDISCLOSED Area**:
   ```typescript
   if (area.slug === UNDISCLOSED) {
     titleCardOptions.showControls = false;
   }
   ```
   **Reason**: Hidden/undisclosed entities shouldn't have visible controls

3. **Domain Configuration**:
   ```typescript
   // In configurationDefaults.ts
   {
     domains: {
       camera: { showControls: false },  // Cameras don't need group controls
       scene: { showControls: false },   // Scenes are activated, not controlled
     }
   }
   ```

---

## 🎨 Chip Styling & Behavior

### Icon & Color by Domain

```typescript
const DOMAIN_ICONS = {
  light: "mdi:lightbulb",
  climate: "mdi:thermostat",
  cover: "mdi:window-shutter",
  fan: "mdi:fan",
  switch: "mdi:light-switch",
  media_player: "mdi:cast",
  // ... more domains
};

const DOMAIN_COLORS = {
  light: "amber",      // Warm yellow
  climate: "blue",     // Cool blue
  cover: "purple",     // Purple
  fan: "cyan",         // Cyan
  switch: "green",     // Green
  media_player: "pink",// Pink
  // ... more domains
};
```

### State-Based Colors

```typescript
// In AggregateChip.getChip()
const anyActive = entities.some(entityId => {
  const state = Helper.getEntityState(entityId);
  return activeStates.includes(state?.state);
});

chipConfig.icon_color = anyActive ? domainColor : "grey";
```

**Example**: Light chip shows amber when ANY light is on, grey when ALL lights are off.

### Content Display (Entity Count)

```typescript
// Only show count when explicitly enabled
if (show_content && entities.length > 0) {
  chipConfig.content = `${entities.length}`;
}
```

**Use Cases**:
- Global badges: `show_content: true` → Shows total entity count
- Title chips: `show_content: false` (default) → No count, cleaner look

---

## 🔄 Recent Fixes & Improvements

### Fix 1: Control Chips Missing in AreaView/FloorView (Commit 3b04c08)

**Problem**: No control chips appeared for ANY domain in AreaView and FloorView.

**Root Cause**:
1. `utils.ts` forced `showControls = false` for AGGREGATE_DOMAINS
2. Non-aggregate domains didn't create chips when no device_class specified
3. `ControllerCard.ts` didn't support `device_class: null`

**Solution**:
1. Modified `Helper.ts` to support `device_class: null` (only entities WITHOUT device_class) vs `undefined` (all entities)
2. Modified `ControllerCard.ts` to use `null` for "only without device_class" and create chips properly
3. Modified `utils.ts` to remove special treatment of AGGREGATE_DOMAINS and respect `showControls` config
4. Modified `AggregateChip.ts` to fix global scope (changed `area_slug: undefined` to `"global"`)

**Files Modified**:
- `src/Helper.ts` - Added `device_class: null` support
- `src/cards/ControllerCard.ts` - Chip generation logic
- `src/utils.ts` - Removed AGGREGATE_DOMAINS special case
- `src/chips/AggregateChip.ts` - Fixed global scope handling

---

### Fix 2: Global Badges Missing Entity Count (Commit 8cc9d43)

**Problem**: Global badges in domain views showed only icon, not entity count.

**Root Cause**: Views didn't pass `show_content: true` to AggregateChip constructor.

**Solution**: Added `show_content: true` to all domain views:
```typescript
const aggregateChip = new AggregateChip({
  domain: this.domain,
  area_slug: "global",
  translationKey: "cover",
  activeStates: ["open", "opening"],
  features: [],
  show_content: true,  // ← Added this
});
```

**Files Modified**:
- `src/views/CoverView.ts`
- `src/views/LightView.ts`
- `src/views/ClimateView.ts`
- `src/views/FanView.ts`
- `src/views/MediaPlayerView.ts`
- `src/views/SwitchView.ts`

---

### Fix 3: UNDISCLOSED Filter Broken for Aggregate Domains (Commit 8cc9d43)

**Problem**: CoverView global badge included covers from UNDISCLOSED area.

**Root Cause**: `getGlobalEntitiesExceptUndisclosed()` only checked base domain (e.g., `"cover"`), but entities with device_class are stored in variant keys (e.g., `"cover:blind"`).

**Solution**: Updated filter to check ALL device_class variants:
```typescript
// Check base domain
if (Helper.areas[UNDISCLOSED]?.domains?.[domain]?.includes(entity.entity_id)) {
  return false;
}

// Check ALL device_class variants
const deviceClasses = DEVICE_CLASSES[domain] || [];
for (const dc of deviceClasses) {
  const variantTag = `${domain}:${dc}`;
  if (Helper.areas[UNDISCLOSED]?.domains?.[variantTag]?.includes(entity.entity_id)) {
    return false;
  }
}
```

**Files Modified**: `src/utils.ts` (lines 405-428)

---

### Fix 4: Sensor/Binary Sensor Chip Clutter (Commit 8cc9d43)

**Problem**: Sensor has 57 device_classes, binary_sensor has 24 → too many chips cluttered area/floor titles.

**Solution**: Hard-coded disable for sensor/binary_sensor in 4 locations:
```typescript
// Disable chips for sensor/binary_sensor (too many device_classes)
if (domain === "sensor" || domain === "binary_sensor") {
  titleCardOptions.showControls = false;
}
```

**Locations Modified**:
1. `utils.ts:508-511` - Area titles in processFloorsAndAreas
2. `utils.ts:533-537` - Floor titles in processFloorsAndAreas
3. `utils.ts:648-652` - FloorView sections in processEntitiesForAreaOrFloorView
4. `utils.ts:678-682` - AreaView sections in processEntitiesForAreaOrFloorView

**Design Decision**: Keep cover chips (10 device_classes is acceptable), but disable sensor/binary_sensor (too many).

---

## 🧪 Testing Checklist

### Manual Testing

**Global Chips (in Domain Views)**:
- [ ] LightView: Shows global light chip with icon AND count
- [ ] CoverView: Shows global cover chip with icon AND count
- [ ] ClimateView: Shows global climate chip with icon AND count
- [ ] Chip excludes UNDISCLOSED entities correctly

**Floor Chips (in FloorView)**:
- [ ] Floor titles show chips for light, climate, cover, fan, switch, media_player
- [ ] Floor titles DO NOT show chips for sensor, binary_sensor
- [ ] Chips control only entities on that floor

**Area Chips (in AreaView & FloorView)**:
- [ ] Area titles show chips for light, climate, cover, fan, switch, media_player
- [ ] Area titles DO NOT show chips for sensor, binary_sensor
- [ ] Chips control only entities in that area
- [ ] UNDISCLOSED area has NO chips

**Chip Functionality**:
- [ ] Tap chip opens appropriate popup
- [ ] Popup shows correct entities
- [ ] Controls work (on/off, brightness, etc.)
- [ ] State changes reflect in chip color

**Edge Cases**:
- [ ] Areas with no entities: No chips displayed
- [ ] Mixed device_class covers: Chips appear for all variants
- [ ] Covers without device_class: Separate chip appears

---

## 📊 Performance Considerations

### Memoization

```typescript
// getGlobalEntitiesExceptUndisclosed is memoized
export const getGlobalEntitiesExceptUndisclosed = memoize(function(...) {
  // Heavy computation only runs once per domain/device_class combo
});
```

**Why**: Global entity filtering with device_class variant checks is expensive. Memoization caches results.

### Lazy Chip Generation

```typescript
// Chips only generated when showControls = true
if (!showControls) return [];  // Skip chip creation
```

**Why**: Avoid unnecessary chip objects for domains/areas that don't need controls.

### Entity Count Optimization

```typescript
// Don't fetch entity states if not showing content
if (show_content) {
  // Only then fetch states and count
}
```

**Why**: Fetching entity states is expensive. Only do it when count will be displayed.

---

## 🔮 Future Enhancements

1. **Device_Class-Specific Icons**:
   - Show mdi:blinds for blind chips, mdi:curtains for curtain chips
   - Currently all cover chips use mdi:window-shutter

2. **Smart Chip Ordering**:
   - Order chips by frequency of use
   - Or by domain priority (lights before sensors)

3. **Chip Groups**:
   - Collapse multiple chips into dropdown when > 5 chips
   - Reduce visual clutter in areas with many domains

4. **Custom Chip Actions**:
   - Allow users to configure custom tap actions
   - E.g., "Turn on lights at 50% brightness"

5. **Chip Animations**:
   - Animate state changes (color transitions)
   - Pulse animation when entities change state

6. **Conditional Chip Display**:
   - Hide chips when no entities are available
   - E.g., hide climate chip in areas without thermostats

---

## 📚 Related Files

### Core Files
- `src/chips/AggregateChip.ts` - Main chip class
- `src/cards/ControllerCard.ts` - Title cards with chips
- `src/Helper.ts` - Entity filtering & resolution
- `src/utils.ts` - Global entity filtering, chip generation logic

### View Files (Global Badges)
- `src/views/LightView.ts`
- `src/views/ClimateView.ts`
- `src/views/CoverView.ts`
- `src/views/FanView.ts`
- `src/views/MediaPlayerView.ts`
- `src/views/SwitchView.ts`

### Configuration
- `src/configurationDefaults.ts` - Domain chip defaults

### Types
- `src/types/strategy/cards.ts` - Chip type definitions
- `src/variables.ts` - Constants (AGGREGATE_DOMAINS, DEVICE_CLASSES)

---

## 🎓 Developer Guide

### Adding Chips to a New Domain

1. **Add domain to configurationDefaults.ts**:
   ```typescript
   my_domain: {
     showControls: true,  // Enable chips
     hidden: false,
     order: 10,
   }
   ```

2. **Create domain view with global chip**:
   ```typescript
   class MyDomainView extends AbstractView {
     createSectionBadges(): LovelaceBadgeConfig[] {
       const badges: LovelaceBadgeConfig[] = [];
       
       // Global chip
       const aggregateChip = new AggregateChip({
         domain: "my_domain",
         area_slug: "global",
         show_content: true,
       });
       if (aggregateChip.getChip()) {
         badges.push({ type: "custom:mushroom-chips-card", chips: [aggregateChip.getChip()], alignment: "end" });
       }
       
       // Refresh chip (centered)
       badges.push({ type: "custom:mushroom-chips-card", chips: [new RefreshChip().getChip()], alignment: "center" });
       
       return badges;
     }
   }
   ```

3. **Add icon & color** (in AggregateChip.ts):
   ```typescript
   const icon = Helper.icons.my_domain?._?.default ?? "mdi:default-icon";
   const chipColor = "green";  // Choose domain color
   ```

4. **Add translations**:
   ```json
   {
     "my_domain": "My Domain",
     "turn_all_on_my_domain": "Turn All On",
     "turn_all_off_my_domain": "Turn All Off"
   }
   ```

5. **Test**:
   - Build: `npm run build`
   - Restart Home Assistant
   - Check global badge, floor chips, area chips

### Debugging Chip Issues

**Chips not appearing**:
```typescript
// Add console.log in ControllerCard.createCard()
console.log("showControls:", showControls);
console.log("controlChipOptions:", controlChipOptions);
console.log("Generated chips:", chips);
```

**Wrong entities in chip**:
```typescript
// Add console.log in AggregateChip.getChip()
console.log("Domain:", this.#domain);
console.log("Device class:", this.#device_class);
console.log("Area slug:", this.#area_slug);
console.log("Entities:", entities);
```

**UNDISCLOSED entities not filtered**:
```typescript
// Add console.log in getGlobalEntitiesExceptUndisclosed()
console.log("Before filter:", entities.length);
console.log("After filter:", filtered.length);
console.log("UNDISCLOSED entities:", Helper.areas[UNDISCLOSED]?.domains);
```

---

**This document is the definitive guide for understanding and modifying the chip system in Linus Dashboard.**
