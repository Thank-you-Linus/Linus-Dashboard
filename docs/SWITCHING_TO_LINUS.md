# 🔄 Switching to Linus Dashboard

<p align="center">
  <a href="SWITCHING_TO_LINUS-fr.md"><strong>🇫🇷 Lire en français</strong></a>
</p>

Linus Dashboard is an auto-generated dashboard for Home Assistant, with no YAML: it is built from the areas and floors you already have, and it organizes your devices by room, floor and device type. This page tells you what you keep, what to check after installing, and how to go back if Linus is not for you.

---

## Who this page is for

You already use a dashboard in Home Assistant and you want to try Linus. You may be coming from:

- **(a) The default Home Assistant dashboard**, the one Home Assistant builds for you and that you never edited.
- **(b) A hand-made dashboard**, written in YAML or built with the visual editor.
- **(c) Another auto-generated dashboard**, built from a strategy rather than written card by card.

Whichever it is, the steps below are the same: install Linus next to it, check a few points, and keep or remove it.

---

## What Linus reads, what it adds

- **Your areas, floors, devices and entities are read, never changed.** Linus never changes your areas, floors, devices or entities. It adds its own group devices and entities (one device per area, one per floor and one for the whole house, with "Linus Dashboard" as manufacturer). Excluding a domain in the integration options also stops Linus from creating the group entities of that domain.
- **Excluded and hidden items stay out.** Domains, device classes, entities, devices, areas, floors and labels you exclude in the Linus options do not appear, and neither do entities you have hidden in Home Assistant.
- **Unavailable entities stay visible.** They are listed last and gathered in the Unavailable view, so you can fix them.
- **Devices with no area are grouped in an unassigned area**, labelled "Area not found." (Home Assistant's own text, in your language). Assign them an area in Home Assistant to place them in the right room.
- **Rooms follow your Home Assistant order.** Linus uses the order you set in Home Assistant. [Learn more →](MANUAL_ORDERING.md)
- **Linus has its own panel.** It adds a "Linus Dashboard" entry with a bowtie icon to the sidebar. Your existing dashboards stay where they are.
- **Linus never edits your existing dashboards.** A generated dashboard that automatically discovers entities may also show Linus's group entities; check that dashboard after installing. Linus loads its bundled custom cards on every dashboard. Only one copy of a given custom card can be loaded: if you also installed one of Linus's bundled cards separately, either copy may end up being used.

---

## Where are you coming from?

### (a) The default Home Assistant dashboard

**What you keep:** the default dashboard is still there, in the sidebar, unchanged.

**What to check:** the default dashboard automatically discovers entities, so it may also show Linus's group entities; check it after installing. Only dashboards with their own views can be embedded in Linus: the default dashboard, which you never edited, has none, so it cannot be embedded.

**Going back:** see [Going back / uninstalling](#going-back--uninstalling).

### (b) A hand-made dashboard (YAML or visual editor)

**What you keep:** your dashboard and its views, unchanged. You do not have to rebuild them: a hand-made dashboard has its own views, so you can embed them as tabs in Linus (energy, cameras, media…). [Learn more →](EMBEDDED_DASHBOARDS.md)

**What to check:** if your dashboard uses custom cards that Linus also bundles, only one copy of a given custom card can be loaded: either the copy loaded by Linus or the one you installed separately may end up being used. Open your dashboard after installing Linus and check that it still looks the way you expect.

**Going back:** see [Going back / uninstalling](#going-back--uninstalling). Read the warning about bundled cards before removing the resources.

### (c) Another auto-generated dashboard

**What you keep:** the other dashboard stays in the sidebar; Linus does not change its configuration.

**What to check:** a generated dashboard that automatically discovers entities may also show Linus's group entities; check it after installing. Only dashboards with their own views can be embedded in Linus: a dashboard built only from a strategy has none, so it cannot be embedded.

**Going back:** see [Going back / uninstalling](#going-back--uninstalling).

---

## Checklist after installing

1. **Devices with no area:** open the unassigned area in Linus and assign those devices an area in Home Assistant (Settings → Areas, labels & zones).
2. **Excluded or hidden items:** if something is missing, check the exclusions in the Linus options (Settings → Devices & Services → Linus Dashboard → Configure) and whether the entity is hidden in Home Assistant.
3. **Unavailable entities:** open the Unavailable view and fix or remove what is listed there.
4. **Room order:** reorder your areas in Home Assistant if needed; Linus follows that order. [Learn more →](MANUAL_ORDERING.md)
5. **Your other dashboards:** open them once and check that they still look right (see the note on bundled cards above).

---

## Going back / uninstalling

Your previous dashboard was never modified, so going back means removing Linus:

1. **Delete the integration:** Settings → Devices & Services → Linus Dashboard → ⋮ → Delete. This removes the Linus panel from the sidebar.
2. Go to **Settings → Dashboards → ⋮ (top right) → Resources**. On older Home Assistant versions, this entry only appears once advanced mode is turned on in your user profile.
3. **Delete every resource whose URL starts with `/linus_dashboard_files/`.** Deleting the integration does not remove them.
4. **Restart Home Assistant** (Settings → System, restart button at the top right). Home Assistant only stops serving the `/linus_dashboard_files/` files after a restart.
5. **Hard-refresh your browser** (Ctrl+F5, or Cmd+Shift+R on macOS).
6. *(Optional)* **If you installed Linus through HACS, remove it from HACS too** to delete its files, then restart Home Assistant.

> ⚠️ **Bundled cards:** if one of your other dashboards uses a custom card that came only with Linus, that card stops displaying once the resources are removed. Install that card separately before removing the resources if you want to keep it.

If your Lovelace resources are managed in YAML, there is nothing to delete in step 3: Linus loads its files without adding them to the list, and the restart in step 4 is enough.

Home Assistant removes Linus's devices and entities with the integration. If a device with "Linus Dashboard" as manufacturer is still listed in Settings → Devices & Services → Devices, delete it.

---

## Related guides

- [🚀 Quick Start Guide](QUICK_START.md#step-2-configure-2-minutes) - Install and configure Linus in 5 minutes
- [🎨 Embedded Dashboards](EMBEDDED_DASHBOARDS.md#how-to-configure) - Bring your own views into Linus
- [📍 Manual Area & Floor Ordering](MANUAL_ORDERING.md#how-to-use) - Choose the order of your rooms and floors
- [📚 Documentation Map](DOCUMENTATION_MAP.md) - Every guide in one place
