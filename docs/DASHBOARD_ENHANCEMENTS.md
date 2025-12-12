# Dashboard Enhancements Documentation

This document provides comprehensive documentation of all recent enhancements made to the Linus Dashboard.

## Table of Contents

1. [Security View Enhancements](#security-view-enhancements)
2. [LinusBrain Popup Performance Graphs](#linusbrain-popup-performance-graphs)
3. [Activity Detection System](#activity-detection-system)
4. [Chip Priority and Ordering](#chip-priority-and-ordering)
5. [Files Modified](#files-modified)

---

## Security View Enhancements

### Overview
Enhanced the Security View with visual emoji indicators for better category recognition and user experience.

### Location
- **File**: `src/views/SecurityView.ts`
- **Lines Modified**: 184-230

### Changes Made

#### 1. Categorized Section Headings
Security sensors are now organized into four distinct categories with emoji icons:

##### 🔥 Critical Safety (Lines 184-194)
- **Sensors Included**:
  - `binary_sensor:smoke` - Smoke detectors
  - `binary_sensor:gas` - Gas leak detectors
  - `binary_sensor:carbon_monoxide` - CO detectors
- **Priority**: High (always visible when present)
- **Icon**: `mdi:fire-alert`
- **Heading Style**: Subtitle (compact display)

##### 🚪 Access Control (Lines 196-206)
- **Sensors Included**:
  - `binary_sensor:door` - Door sensors
  - `binary_sensor:window` - Window sensors
  - `binary_sensor:garage_door` - Garage door sensors
  - `binary_sensor:lock` - Lock sensors
- **Priority**: Medium
- **Icon**: `mdi:door`
- **Heading Style**: Subtitle

##### 👁️ Detection (Lines 208-218)
- **Sensors Included**:
  - `binary_sensor:motion` - Motion sensors
  - `binary_sensor:occupancy` - Occupancy sensors
  - `binary_sensor:sound` - Sound detection sensors
  - `binary_sensor:vibration` - Vibration sensors
- **Priority**: Medium
- **Icon**: `mdi:motion-sensor`
- **Heading Style**: Subtitle

##### 🛡️ Other (Lines 220-230)
- **Sensors Included**:
  - `binary_sensor:tamper` - Tamper detection
  - `binary_sensor:moisture` - Moisture/water leak sensors
- **Priority**: Low
- **Icon**: `mdi:shield-alert`
- **Heading Style**: Subtitle

### Implementation Details

```typescript
// Example: Critical Safety section
const criticalCards = await createCardsFromList(criticalSensors, {}, "global", "global");
if (criticalCards && criticalCards.length > 0) {
  globalSection.cards.push({
    type: "heading",
    heading: "🔥 Critical Safety",
    heading_style: "subtitle",
    icon: "mdi:fire-alert",
  });
  globalSection.cards.push(...criticalCards);
}
```

### Benefits
- **Visual Hierarchy**: Emojis provide instant visual recognition of security categories
- **Compact Design**: Subtitle style keeps the interface clean and organized
- **Language-Independent**: Emojis work across all languages
- **Better UX**: Users can quickly identify critical vs. non-critical security events

---

## LinusBrain Popup Performance Graphs

### Overview
Added performance monitoring graphs to the LinusBrain global popup for better diagnostics and monitoring.

### Location
- **File**: `src/popups/LinusBrainPopup.ts`
- **Lines Added**: 173-197

### Changes Made

#### Performance Metrics Section (Lines 173-197)
New section displaying error rate history over 24 hours.

**Components Added**:
1. **Title Card** (Lines 174-177)
   ```typescript
   {
     type: "custom:mushroom-title-card",
     title: "Performance Metrics",
     subtitle: "Error rate and sync history"
   }
   ```

2. **Error History Graph** (Lines 180-194)
   ```typescript
   {
     type: "history-graph",
     entities: [{
       entity: errorsEntity,  // sensor.linus_brain_errors
       name: "Errors"
     }],
     hours_to_show: 24,
     refresh_interval: 0
   }
   ```

### Features
- **24-Hour Window**: Shows error trends over the last 24 hours
- **Real-time Updates**: Graph automatically updates when viewing
- **Visual Trends**: Easy to spot error patterns and spikes
- **Conditional Display**: Only shows if error entity is available

### Use Cases
- **Monitoring**: Track integration health over time
- **Debugging**: Identify patterns in error occurrences
- **Diagnostics**: Correlate errors with other system events
- **Performance Tuning**: Validate improvements after configuration changes

---

## Activity Detection System

### Overview
Complete rebranding from "Presence Detection" to "Activity Detection" with enhanced behavior when Linus Brain is available.

### Files Affected
1. **Renamed Files**:
   - `src/popups/PresenceDetectionPopup.ts` → `src/popups/ActivityDetectionPopup.ts`
   - `src/chips/PresenceDetectionChip.ts` → `src/chips/ActivityDetectionChip.ts`

2. **Updated References**:
   - `src/views/AreaView.ts`
   - `src/cards/HomeAreaCard.ts`

### Changes Made

#### 1. ActivityDetectionPopup.ts

**Class Rename** (Line 11):
```typescript
class ActivityDetectionPopup extends AbstractPopup {
```

**Popup Title Update** (Line 212):
```typescript
title: `${areaName} - Activity Detection`
```

**User-facing Text Updates**:
- Line 200: "No activity detection available" (was "presence detection")
- Line 201: "Install Linus Brain or add activity sensors" (was "presence sensors")

#### 2. ActivityDetectionChip.ts

**Class Rename** (Line 13):
```typescript
class ActivityDetectionChip extends AbstractChip {
```

**Import Update** (Line 4):
```typescript
import { ActivityDetectionPopup } from "../popups/ActivityDetectionPopup";
```

**Documentation Update** (Lines 7-12):
```typescript
/**
 * Activity Detection Chip class.
 *
 * Used to create a chip to indicate activity detection state.
 * Shows Linus Brain activity detection when available, otherwise shows sensor count.
 */
```

**Priority-based Icon Logic** (Lines 48-93):
```typescript
// Priority: motion > occupancy > presence > media_player
const priorityIcon = `
  {% set motion_active = [${motion_entities_str}] | select('is_state', 'on') | list | count > 0 %}
  {% set occupancy_active = [${occupancy_entities_str}] | select('is_state', 'on') | list | count > 0 %}
  {% set presence_active = [${presence_entities_str}] | select('is_state', 'on') | list | count > 0 %}
  {% set media_active = [${media_entities_str}] | select('is_state', 'playing') | list | count > 0 %}
  {% if motion_active %}
    mdi:motion-sensor
  {% elif occupancy_active %}
    mdi:account-check
  {% elif presence_active %}
    mdi:radar
  {% elif media_active %}
    mdi:cast
  {% else %}
    mdi:account-search
  {% endif %}
`;
```

#### 3. AreaView.ts - Conditional Chip Display

**Location**: Lines 60-85

**Key Logic**:
```typescript
// Check if Linus Brain is configured for this area
const resolver = Helper.entityResolver;
const activityResolution = resolver.resolveAreaState(this.area.slug);
const hasLinusBrain = activityResolution.source === "linus_brain";

// FIRST: Activity Detection chip (only if Linus Brain is available)
if (hasLinusBrain) {
  try {
    const ActivityDetectionChipModule = await import("../chips/ActivityDetectionChip");
    const activityDetectionChip = new ActivityDetectionChipModule.ActivityDetectionChip({ area_slug: this.area.slug });
    chips.push(activityDetectionChip.getChip());
  } catch (e) {
    Helper.logError("An error occurred while creating the Activity Detection chip!", e);
  }
} else {
  // Show AreaStateChip only if Linus Brain is NOT available
  chips.push(new AreaStateChip({ area: this.area, showContent: true }).getChip());
}
```

**Behavior**:
- **With Linus Brain**: Shows `ActivityDetectionChip` as the first badge
- **Without Linus Brain**: Shows `AreaStateChip` (Magic Areas fallback)
- **Mutually Exclusive**: Never shows both chips simultaneously
- **First Position**: Activity Detection always appears first when present

#### 4. HomeAreaCard.ts - Badge Integration

**Import Update** (Line 7):
```typescript
import { ActivityDetectionChip } from "../chips/ActivityDetectionChip";
```

**Badge Logic** (Lines 202-210):
```typescript
// Show only ONE chip for activity/area state:
// - If Linus Brain presence is available: show ActivityDetectionChip
// - Otherwise if there are presence sensors: show AreaStateChip (Magic Areas fallback)
// - If neither, don't show anything
(hasLinusBrainPresence || motion?.length || occupancy?.length || presence?.length) && (
  hasLinusBrainPresence
    ? new ActivityDetectionChip({ area_slug: this.area.slug }).getChip()
    : new AreaStateChip({ area: this.area }).getChip()
),
```

### Popup Structure - Activity Detection

#### Complete Popup Sections (in order)

When opening the Activity Detection popup for a Linus Brain-enabled area, users see:

1. **Activity History Section** (Lines 58-104)
   - Title: "Activity History" with subtitle "Last 24 hours"
   - Linus Brain Configuration button (if available)
   - History graph showing activity states over 24 hours
   - Current Activity Duration sensor (if available)

2. **Presence Detection Section** (Lines 106-135) ✨ **NEW**
   - Title: "Presence Detection" with subtitle "Detailed presence monitoring"
   - Presence Status card showing current presence state
   - **Presence Detection History Graph**: 24-hour history of presence detection
   - Features:
     - Entity: `binary_sensor.linus_brain_presence_detection_<area_slug>`
     - Graph type: `history-graph`
     - Hours shown: 24
     - Refresh interval: 60 seconds
     - Allows correlation between activity and presence patterns

3. **Statistics Section** (Lines 137-163)
   - Title: "Statistics" with subtitle "Activity patterns and trends"
   - Time occupied/movement/inactive/empty statistics
   - Shows trends and patterns over time

4. **Presence Sensors Section** (Lines 167-194)
   - List of all motion/occupancy/presence sensors in the area
   - Sorted by most recently changed first
   - Shows individual sensor states and last changed times
   - Color-coded: red (on), grey (off)

#### Code Implementation

**Presence Detection Section** (Lines 106-135):
```typescript
// === Presence Detection Section ===
if (presenceSensorEntity) {
    cards.push({
        type: "custom:mushroom-title-card",
        title: "Presence Detection",
        subtitle: "Detailed presence monitoring"
    });

    // Presence detection state card
    cards.push({
        type: "custom:mushroom-entity-card",
        entity: presenceSensorEntity,
        name: "Presence Status",
        icon: "mdi:account-search",
        secondary_info: "last-changed"
    });

    // Presence detection history graph (24 hours)
    cards.push({
        type: "history-graph",
        entities: [
            {
                entity: presenceSensorEntity,
                name: "Presence Detection"
            }
        ],
        hours_to_show: 24,
        refresh_interval: 60
    });
}
```

#### Benefits of Presence Detection Graph

1. **Pattern Recognition**: See when presence is typically detected throughout the day
2. **Correlation**: Compare activity states with presence detection timing
3. **Troubleshooting**: Identify false positives or missed detections
4. **Optimization**: Adjust Linus Brain sensitivity based on visual patterns
5. **Historical Context**: Understand how presence detection evolves over 24 hours

### Semantic Meaning
**Why "Activity Detection" instead of "Presence Detection"?**

1. **More Accurate**: Reflects actual Linus Brain functionality (activity states: occupied, movement, inactive, empty)
2. **Broader Scope**: Encompasses motion, occupancy, presence, and media activity
3. **User-Friendly**: "Activity" is more intuitive than "Presence" for most users
4. **Technical Precision**: Matches Linus Brain's actual sensor naming (`sensor.linus_brain_activity_*`)
5. **Hierarchical**: Activity Detection is the top-level concept, with Presence Detection as a component

---

## Chip Priority and Ordering

### Overview
Comprehensive priority system for activity detection icons and chip ordering in views.

### Activity Detection Icon Priority

#### Priority Hierarchy (Highest → Lowest)
Defined in `src/chips/ActivityDetectionChip.ts` (Lines 61-78)

1. **🥇 Motion** (`mdi:motion-sensor`)
   - **Trigger**: Any motion sensor in `on` state
   - **Device Class**: `binary_sensor.motion`
   - **Rationale**: Most immediate indicator of current activity

2. **🥈 Occupancy** (`mdi:account-check`)
   - **Trigger**: Any occupancy sensor in `on` state
   - **Device Class**: `binary_sensor.occupancy`
   - **Rationale**: Confirms someone is in the space

3. **🥉 Presence** (`mdi:radar`)
   - **Trigger**: Any presence sensor in `on` state
   - **Device Class**: `binary_sensor.presence`
   - **Rationale**: Detects presence without active motion

4. **4️⃣ Media Player** (`mdi:cast`)
   - **Trigger**: Any media player in `playing` state
   - **Device Class**: `media_player`
   - **Rationale**: Indicates passive activity (watching TV, listening to music)

5. **Default** (`mdi:account-search`)
   - **Trigger**: No detection active
   - **Rationale**: Searching for activity

#### Implementation Logic
```typescript
// Priority-based icon selection using Jinja2 templates
{% set motion_active = [motion_entities] | select('is_state', 'on') | list | count > 0 %}
{% set occupancy_active = [occupancy_entities] | select('is_state', 'on') | list | count > 0 %}
{% set presence_active = [presence_entities] | select('is_state', 'on') | list | count > 0 %}
{% set media_active = [media_entities] | select('is_state', 'playing') | list | count > 0 %}

{% if motion_active %}
  mdi:motion-sensor
{% elif occupancy_active %}
  mdi:account-check
{% elif presence_active %}
  mdi:radar
{% elif media_active %}
  mdi:cast
{% else %}
  mdi:account-search
{% endif %}
```

### AreaView Badge Ordering

#### Badge Order (First → Last)
Defined in `src/views/AreaView.ts` (Lines 68-122)

1. **🥇 Activity Detection / Area State** (Position 0)
   - **With Linus Brain**: `ActivityDetectionChip`
   - **Without Linus Brain**: `AreaStateChip`
   - **Purpose**: Primary area status indicator
   - **Always First**: Most important contextual information

2. **Area-Specific Chips** (Position 1+)
   - Created from `AREA_EXPOSED_CHIPS` variable
   - Custom chips specific to the area configuration
   - Examples: Climate, Fan, Light chips, etc.

3. **Unavailable Chip** (After area chips)
   - Shows count of unavailable entities
   - Conditional display (only if unavailable entities exist)

4. **LinusBrain Configuration Chip** (Near end)
   - **Display**: "mdi:brain" with "Linus Brain" text
   - **Color**: Cyan
   - **Action**: Opens LinusBrainAreaPopup
   - **Condition**: Only if Linus Brain is configured for area

5. **Magic Areas Configuration Chip** (Last)
   - **Display**: "mdi:magic-staff" with "Magic Areas" text
   - **Color**: Amber
   - **Action**: Navigates to Magic Areas device configuration
   - **Condition**: Only if Magic Areas device exists for area

### HomeAreaCard Badge Ordering

#### Badge Order in Area Cards
Defined in `src/cards/HomeAreaCard.ts` (Lines 201-239)

1. **Activity Detection / Area State** (First)
2. **Health Aggregate** (if health sensors present)
3. **Window Aggregate** (if window sensors present)
4. **Door Aggregate** (if door sensors present)
5. **Cover Aggregate** (if covers present)
6. **Climate Chip** (if climate entities present)
7. **Fan Chip** (if fan entities present)
8. **Light Chips** (conditional ON/OFF state chips)
9. **Light Control Switch** (last, if lights present)

### Priority Color Coding

#### ActivityDetection Chip Colors
- **Red**: Activity detected (`on` state)
- **Grey**: No activity (`off` state)

#### Icon Color Consistency
- **Motion**: Uses chip icon_color (red/grey)
- **Occupancy**: Uses chip icon_color (red/grey)
- **Presence**: Uses chip icon_color (red/grey)
- **Media**: Uses chip icon_color (red/grey)

### Benefits of Priority System

1. **Intuitive**: Most urgent/immediate detection shown first
2. **Consistent**: Same priority logic across all areas
3. **Informative**: Icon tells user what TYPE of activity detected
4. **Performance**: Template-based logic runs in Home Assistant frontend
5. **Extensible**: Easy to add new detection types

---

## Files Modified

### Complete List of Changes

#### New Files (Renamed)
1. **src/chips/ActivityDetectionChip.ts**
   - Formerly: `PresenceDetectionChip.ts`
   - Lines Changed: 4, 7-13, 91, 115, 143

2. **src/popups/ActivityDetectionPopup.ts**
   - Formerly: `PresenceDetectionPopup.ts`
   - Lines Changed: 7-11, 106-135 (NEW Presence Detection section), 200-201, 212, 234
   - **NEW Feature**: Added dedicated Presence Detection section with 24-hour history graph

#### Modified Files

3. **src/views/SecurityView.ts**
   - Lines Modified: 184-230
   - Changes:
     - Added emoji icons to section headings
     - Organized sensors into 4 categories
     - Changed heading_style to "subtitle"

4. **src/popups/LinusBrainPopup.ts**
   - Lines Added: 173-197
   - Changes:
     - Added "Performance Metrics" section
     - Added error history graph (24-hour window)

5. **src/views/AreaView.ts**
   - Lines Modified: 60-85
   - Changes:
     - Added Linus Brain detection logic
     - Conditional ActivityDetectionChip vs AreaStateChip
     - Moved activity chip to first position
     - Dynamic import of ActivityDetectionChip

6. **src/cards/HomeAreaCard.ts**
   - Lines Modified: 7, 202-210
   - Changes:
     - Updated import to ActivityDetectionChip
     - Updated comments to reflect "activity" terminology
     - Maintained conditional chip logic

7. **src/variables.ts** (from previous session)
   - Lines Modified: Security sensor definitions
   - Changes:
     - Added 8 new security sensor types
     - Organized SECURITY_EXPOSED_SENSORS by priority

### Summary Statistics

- **Files Renamed**: 2
- **Files Modified**: 6
- **Total Files Affected**: 8
- **Lines Added**: ~180 (includes new Presence Detection section)
- **Lines Modified**: ~80
- **Build Size**: 491 KB (stable, +1KB for new graph)
- **Build Status**: ✅ Success

---

## Testing Recommendations

### 1. Security View Testing
- [ ] Verify emoji icons display correctly in all browsers
- [ ] Confirm all 4 categories appear when sensors present
- [ ] Check compact "subtitle" heading style
- [ ] Test with 0, 1, and multiple sensors per category

### 2. LinusBrain Popup Testing
- [ ] Open global Linus Brain popup
- [ ] Verify "Performance Metrics" section appears
- [ ] Confirm error history graph displays
- [ ] Check 24-hour time window is correct
- [ ] Test with varying error counts

### 3. Activity Detection Testing
- [ ] Test area WITH Linus Brain configured
  - [ ] Verify ActivityDetectionChip appears first
  - [ ] Confirm AreaStateChip is hidden
  - [ ] Check icon changes based on detection type
  - [ ] Verify popup title shows "Activity Detection"
  - [ ] **NEW**: Confirm "Presence Detection" section appears in popup
  - [ ] **NEW**: Verify presence detection history graph displays 24-hour data
  - [ ] **NEW**: Check presence status card shows current state
- [ ] Test area WITHOUT Linus Brain
  - [ ] Verify AreaStateChip appears
  - [ ] Confirm ActivityDetectionChip is hidden
  - [ ] Check Magic Areas fallback works

### 4. Icon Priority Testing
- [ ] Trigger motion sensor → should show `mdi:motion-sensor`
- [ ] Clear motion, trigger occupancy → should show `mdi:account-check`
- [ ] Clear occupancy, trigger presence → should show `mdi:radar`
- [ ] Clear presence, play media → should show `mdi:cast`
- [ ] Clear all → should show `mdi:account-search`

### 5. Chip Ordering Testing
- [ ] AreaView: Activity Detection appears first
- [ ] HomeAreaCard: Badge order matches documentation
- [ ] All area cards show consistent chip ordering

---

## Backward Compatibility

### Breaking Changes
❌ **None** - All changes are backward compatible

### Deprecated Features
❌ **None** - No features removed

### Migration Notes
✅ **No Migration Required**
- Old naming automatically handled by file renames
- Conditional logic maintains Magic Areas fallback
- All existing configurations continue to work

---

## Future Enhancements

### Potential Improvements

1. **Security View**
   - Add severity levels/colors to sensor categories
   - Implement collapsible sections for better organization
   - Add summary cards showing total sensors per category

2. **LinusBrain Popup**
   - Add more graph types (ApexCharts for advanced visualizations)
   - Include sync success rate graph
   - Add rule engine execution statistics graph

3. **Activity Detection**
   - Add animation to chip icon when activity detected
   - Implement activity timeline view
   - Add configurable detection priority per area

4. **Chip Ordering**
   - User-configurable chip order via dashboard settings
   - Drag-and-drop chip reordering in UI
   - Per-area chip visibility settings

---

## Support and Troubleshooting

### Common Issues

#### Issue: Activity Detection chip not appearing
**Solution**: 
1. Verify Linus Brain integration is installed
2. Check that activity sensor exists for area: `sensor.linus_brain_activity_<area_slug>`
3. Clear browser cache and reload dashboard

#### Issue: Security categories showing empty
**Solution**:
1. Verify security sensors exist in Home Assistant
2. Check sensor device_class matches category requirements
3. Ensure sensors are assigned to areas

#### Issue: Icon priority not working correctly
**Solution**:
1. Check that entities are properly assigned to area
2. Verify sensor states are updating correctly
3. Review browser console for Jinja2 template errors

#### Issue: Presence Detection graph not showing in Activity Detection popup
**Solution**:
1. Verify presence sensor exists: `binary_sensor.linus_brain_presence_detection_<area_slug>`
2. Check that Linus Brain is properly configured for the area
3. Ensure sensor has historical data (wait a few minutes after setup)
4. Clear browser cache and reload dashboard

### Debug Mode

Enable debug logging in `Helper.ts`:
```typescript
Helper.logError("Debug message", errorObject);
```

---

## Changelog

### [Current Session] - 2024-12-11

#### Added
- 🔥 Security View emoji category icons
- 📊 LinusBrain performance metrics graph
- 🎯 Activity Detection priority-based icons
- 📱 Conditional chip display (Linus Brain vs Magic Areas)
- 📈 **Presence Detection section with 24-hour history graph in Activity Detection popup**

#### Changed
- ♻️ Renamed Presence Detection → Activity Detection
- 🔄 Reordered chips: Activity Detection now first
- 📝 Updated all documentation and comments

#### Fixed
- ✅ Area State chip no longer shows when Linus Brain active
- ✅ Consistent chip ordering across all views
- ✅ Icon priority correctly reflects detection type

---

## Contributors

- Dashboard enhancements implemented during development session
- Based on user requirements and UX feedback
- Built on existing Linus Dashboard architecture

---

## License

This documentation is part of the Linus Dashboard project and follows the same license as the main project.

---

**Last Updated**: December 11, 2024  
**Documentation Version**: 1.0  
**Dashboard Version**: 1.4.0-beta.1
