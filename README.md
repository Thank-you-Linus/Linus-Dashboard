
<div align="center">
  <a href="https://thankyou-linus.com/">
   <img src="images/mongramme-linus-or.png" alt="Logo"  height="200">
   </a>
   <h1 align="center">Linus Dashboard</h3>
      <p align="center">
         Your personal butler
    <br />
    <a href="https://thankyou-linus.com/"><strong>Go to website »</strong></a>
    <br />
    <a href="https://discord.gg/cZ7NH4ex">
        <img src="https://discordapp.com/api/guilds/1104794215440978042/widget.png?style=shield" alt="Linus Shield"/>
    </a>
  </p>
</div>

**Linus Dashboard** is a custom component for Home Assistant that provides a complete, ready-to-use dashboard specifically designed to work with the [hass-magic_areas](https://github.com/jseidl/hass-magic_areas) integration. This dashboard enables visualization of all entities created by hass-magic_areas alongside all standard Home Assistant entities, with a primary focus on simplicity and ease of use.

## Features

- **Comprehensive Entity Visualization**: Automatically displays all entities created by hass-magic_areas as well as all standard Home Assistant entities, providing a centralized view of your smart home.
- **Optimized User Interface**: A clean, intuitive interface that enhances usability and provides quick access to essential controls and information.
- **Quick Installation**: Easy setup as a custom repository in HACS for streamlined updates.
- **Entity Organization by Area**: Automatically organizes entities by area, making navigation and control simpler.
- **Advanced Customization Options**: Supports config_flow for easy configuration of entities, areas, and dashboard settings.

## Development Status

**Linus Dashboard is currently in active development**. We welcome feedback, feature requests, and ideas to make this dashboard even better. Your input is valuable as we work toward creating a powerful yet user-friendly solution for Home Assistant.

## Installation

### Requirements

1. **Home Assistant** (2023.9+ recommended).
2. **HACS** - Home Assistant Community Store.
3. **hass-magic_areas** - Ensure this integration is installed and configured correctly before starting.

### Installation Steps

1. **Adding the Custom Repository**:
   - Go to HACS > Integrations.
   - Click on the three dots in the top right and select "Custom repositories".
   - Add the link to this repository: [https://github.com/Thank-you-Linus/Linus-Dashboard](https://github.com/Thank-you-Linus/Linus-Dashboard) and select the category "Integration".
   - Click "Add".

2. **Installing Linus Dashboard**:
   - Search for **Linus Dashboard** in HACS, install it, and restart Home Assistant.

3. **Configuring the Dashboard**:
   - After restarting, go to `Settings` > `Devices & Services`.
   - Find **Linus Dashboard** and start the configuration flow to select areas and entities.

### Basic Configuration

Once the configuration flow is started, you can:
- Link entities to specific areas as defined by hass-magic_areas.
- Configure visibility options for all entities.
- Customize widget appearance and interaction based on your needs.

## Usage

After setup, Linus Dashboard will automatically display all Home Assistant entities and entities from hass-magic_areas, organized by area. This dashboard provides easy access and control, making it simple to monitor and interact with all parts of your smart home.

## Support & Feedback

If you encounter any issues, please open an [issue on GitHub](https://github.com/Thank-you-Linus/Linus-Dashboard/issues) with a detailed description of the problem. We also encourage feedback and feature requests to improve the dashboard—your input is highly appreciated!

## Contributing

Contributions are welcome! Feel free to fork the project, suggest improvements, or report bugs to help enhance this dashboard.

---

**Note**: Linus Dashboard is an open-source project and does not require any subscription.
