# 📊 Activity Detection Guide

**Understanding room occupancy and activity tracking in Linus Dashboard**

---

## 🎯 What is Activity Detection?

Activity Detection is a core feature of Linus Dashboard that automatically monitors and displays room occupancy and activity status using your existing sensors and media players.

### Key Benefits

- **Automatic sensor discovery** - No manual configuration needed
- **Real-time activity tracking** - See which rooms are occupied
- **Multiple sensor types** - Combine motion, occupancy, presence, and media player data
- **Visual history** - 24-hour activity graphs (with Linus Brain)
- **Smart automation foundation** - Use activity data to trigger automations

### How It Works

**Without Linus Brain:**
- Displays all compatible sensors in each area
- Shows current sensor states and last changed time
- Provides brightness status (dark/bright based on sun position)

**With Linus Brain (Optional):**
- Advanced activity state calculation (Occupied, Movement, Inactive, Empty)
- 24-hour activity history graphs
- Presence sensor aggregation
- Activity duration tracking
- Time-in-state statistics

---

## 🚀 How to Access Activity Detection

### Method 1: Area Card Badge
1. Navigate to any area view in Linus Dashboard
2. Look for the **activity badge** on the area card
3. Click the badge to open the Activity Detection popup

### Method 2: Area View
- The Activity Detection popup shows comprehensive information about all sensors tracking activity in that specific area

---

## 📱 Understanding the Popup

The Activity Detection popup is organized into several sections:

### 1. Status Chips (Top)
Quick overview of current conditions:
- **Brightness**: Dark/Bright indicator
- **Activity**: Current activity state (Linus Brain only)
- **Presence**: Presence sensor status (Linus Brain only)
- **Duration**: Time in current state (Linus Brain only)

### 2. Activity History (Linus Brain only)
- 24-hour graphs showing activity and presence over time
- Helps identify patterns and unusual activity

### 3. Sensors List
**This is where your sensors appear automatically!**

Entities shown here include:
- Binary sensors with `device_class` = motion, occupancy, or presence
- Media players assigned to the area
- Members of Linus Brain presence detection groups (if installed)

Sensors are sorted by:
1. **Active sensors first** (on/playing state)
2. **Most recently changed** within each group

### 4. Explanatory Card
Information about auto-detection criteria and how to add more sensors.

### 5. Add Sensors Button
Opens Home Assistant entity settings to assign sensors to the area.

### 6. Statistics (Linus Brain only)
Time spent in each activity state:
- Occupied
- Movement
- Inactive
- Empty

---

## ✅ Auto-Detection Criteria

### Which Entities Appear Automatically?

Entities appear in the Activity Detection popup if they meet **ALL** of these conditions:

1. **Assigned to the area** in Home Assistant
2. **Match one of these criteria:**
   - Binary sensor with `device_class` = `motion`
   - Binary sensor with `device_class` = `occupancy`
   - Binary sensor with `device_class` = `presence`
   - Media player entity
   - Member of Linus Brain presence detection group

### Entity State Examples

**Will appear:**
```yaml
binary_sensor.living_room_motion:
  device_class: motion
  area_id: living_room
  state: "on"

binary_sensor.desk_occupancy:
  device_class: occupancy
  area_id: office
  state: "off"

media_player.tv:
  area_id: living_room
  state: "playing"
```

**Will NOT appear:**
```yaml
binary_sensor.door_sensor:
  device_class: door  # ❌ Wrong device_class
  area_id: living_room

binary_sensor.motion_sensor:
  # ❌ No area assigned
  device_class: motion

binary_sensor.excluded_sensor:
  device_class: motion
  area_id: living_room
  # ❌ Domain/device_class excluded in Linus Dashboard config
```

---

## 🔧 Troubleshooting

### Problem: No Entities Appearing

**Check 1: Entity Area Assignment**
1. Go to Settings → Devices & Services → Entities
2. Find your sensor entity
3. Verify it's assigned to the correct area
4. If not, click the entity → Settings → Area → Select the correct area

**Check 2: Device Class Attribute**
1. Go to Developer Tools → States
2. Search for your entity (e.g., `binary_sensor.motion_sensor`)
3. Check the `device_class` attribute
4. Should be `motion`, `occupancy`, or `presence`

If missing, add it via `customize.yaml`:
```yaml
homeassistant:
  customize:
    binary_sensor.my_sensor:
      device_class: motion
```

**Check 3: Linus Dashboard Exclusions** ⭐ IMPORTANT
1. Go to Settings → Devices & Services
2. Find "Linus Dashboard" → Click **Configure**
3. Check these settings:
   - **Excluded domains**: Should NOT include `binary_sensor` or `media_player`
   - **Excluded device classes**: Should NOT include `motion`, `occupancy`, or `presence`
   - **Excluded integrations**: Should NOT block your sensor's integration (e.g., Zigbee2MQTT, ESPHome)

**Check 4: UNDISCLOSED Area**
- Entities in the special "UNDISCLOSED" area are hidden by design
- Move entities out of UNDISCLOSED to make them visible

**Check 5: Refresh Dashboard Cache** 🔄
After making changes:
1. Look for the **blue circular arrow icon (🔄)** at the top of the Activity Detection popup
2. Click it to reload the dashboard cache
3. Your newly added/modified sensors should now appear

### Problem: Entities Showing But Not Updating

**Solution 1: Check Entity State**
1. Go to Developer Tools → States
2. Verify the entity is changing state correctly
3. Test by triggering the sensor physically

**Solution 2: Refresh Browser Cache**
- Press `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- This clears cached frontend files

**Solution 3: Restart Home Assistant**
- Sometimes entity registry changes require a restart
- Settings → System → Restart

### Problem: Linus Brain Features Not Showing

**Solution:**
1. Verify Linus Brain integration is installed
2. Check that Linus Brain area state entities exist (e.g., `sensor.linus_brain_activity_[area]`)
3. Ensure Linus Brain is properly configured for your areas

---

## ➕ Adding More Sensors

### Step-by-Step Workflow

**1. Click "Add Sensors" Button**
- Located at the bottom of the Activity Detection popup
- Opens Home Assistant entity settings filtered by the current area

**2. Assign Entity to Area**
In Home Assistant:
- Settings → Devices & Services → Entities
- Find your sensor
- Click the entity → Settings tab
- Area: Select the correct area

**3. Configure Device Class**

**Option A: Via Entity Settings** (Recommended)
- Not all integrations support changing device_class via UI

**Option B: Via `customize.yaml`**
```yaml
homeassistant:
  customize:
    binary_sensor.my_sensor:
      device_class: motion  # or occupancy, or presence
```

**4. Refresh Dashboard Cache** 🔄
- **CRITICAL STEP**: Click the refresh badge (🔄 blue arrow icon) at the top of the Activity Detection popup
- This reloads the sensor list without requiring a full page refresh

**5. Verify**
- Your sensor should now appear in the list
- Check it's sorted correctly (active sensors first)

---

## 🔄 Refresh Badge

### What Is It?

The refresh badge is a **blue circular arrow icon (🔄)** located at the top-right of the Activity Detection popup.

### When to Use It

**Always click the refresh badge after:**
- ✅ Adding new sensors
- ✅ Removing sensors
- ✅ Changing entity area assignments
- ✅ Modifying `device_class` attributes
- ✅ Updating Linus Dashboard exclusion settings
- ✅ Making any entity registry changes

### What It Does

- Reloads the dashboard cache
- Refreshes entity lists
- Updates area configurations
- **No full page reload required** - much faster!

### How to Use

1. Make changes in Home Assistant (assign area, set device_class, etc.)
2. Return to the Activity Detection popup
3. Click the **🔄 icon** at the top
4. Wait 1-2 seconds for cache to refresh
5. Your changes should now be visible

---

## 🏠 Relation to Home Area Card Badge

### Badge Location
- The activity badge appears on area cards in the home view
- Shows current activity state with color coding

### Badge Colors (Linus Brain)
- **Red**: Occupied (active presence detected)
- **Orange**: Movement (recent activity, no continuous presence)
- **Blue**: Inactive (presence detected but no movement)
- **Grey**: Empty (no presence)

### Opening the Popup
- Click the activity badge on any area card
- Opens the same Activity Detection popup
- Shows all sensors for that specific area

---

## 🧠 Linus Brain Integration

### What is Linus Brain?

Linus Brain is an **optional** Home Assistant integration that adds advanced AI-powered activity detection and automation features.

### Without Linus Brain (Default)

The Activity Detection popup shows:
- ✅ List of all compatible sensors
- ✅ Current sensor states
- ✅ Last changed timestamps
- ✅ Brightness status (dark/bright)
- ✅ "Add sensors" functionality

**"Coming Soon" teaser** is shown for advanced features.

### With Linus Brain Installed

Additional features unlocked:
- **Activity state calculation**: Occupied, Movement, Inactive, Empty
- **24-hour history graphs**: Visual timeline of activity and presence
- **Presence sensor aggregation**: Combines multiple sensors intelligently
- **Activity duration tracking**: Time spent in current state
- **Statistics**: Time-in-state breakdown (Occupied, Movement, Inactive, Empty)

### Getting Linus Brain

- Linus Brain is a separate integration
- Visit: [https://thankyou-linus.com/](https://thankyou-linus.com/)
- Subscription-based service with advanced automation capabilities

---

## 💡 Best Practices

### Sensor Placement

**Motion Sensors:**
- Place at room entry points
- Cover main movement paths
- Avoid pointing at windows (false triggers from sun/movement outside)

**Occupancy Sensors:**
- Ideal for desks, beds, sofas
- Detect stationary presence (e.g., mmWave radar)
- Less prone to false negatives than motion sensors

**Presence Sensors:**
- High-end sensors with advanced detection
- Combine motion + occupancy detection
- Best for critical areas (bedroom, home office)

**Media Players:**
- Automatically track entertainment activity
- TV playing = room occupied
- Works great combined with motion/occupancy sensors

### Multiple Sensor Types

**Recommended combinations:**
- **Living Room**: Motion sensor (entry) + Media player (TV)
- **Bedroom**: Occupancy sensor (bed) + Motion sensor (door)
- **Office**: Occupancy sensor (desk) + Motion sensor (entry)
- **Kitchen**: Multiple motion sensors (high traffic, multiple zones)

### Avoid Over-Complicating

- Start with 1-2 sensors per room
- Add more only if you notice missed detections
- Too many sensors can create conflicting data

---

## 🔗 Related Documentation

- [Quick Start Guide](QUICK_START.md) - Get Linus Dashboard running in 5 minutes
- [Embedded Dashboards](EMBEDDED_DASHBOARDS.md) - Integrate custom Lovelace views
- [Manual Ordering](MANUAL_ORDERING.md) - HA 2025.1+ room ordering
- [Main README](../README.md) - Full project documentation

---

## 🆘 Still Having Issues?

### Community Support

- **Discord**: [Join our community](https://discord.com/invite/ej2Xn4GTww)
- **GitHub Discussions**: [Ask questions](https://github.com/Thank-you-Linus/Linus-Dashboard/discussions)
- **GitHub Issues**: [Report bugs](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

### Before Asking for Help

Please include:
1. Home Assistant version
2. Linus Dashboard version
3. Sensor integration (Zigbee2MQTT, ESPHome, etc.)
4. Entity details (from Developer Tools → States)
5. Screenshots of the issue
6. Whether you're using Linus Brain

---

**🎉 Happy activity tracking!**

_For questions or improvements to this guide, please open an issue on GitHub._
