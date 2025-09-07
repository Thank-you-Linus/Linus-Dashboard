const path = require("path");

module.exports = {
  root_dir: path.resolve(__dirname, ".."),

  // Build directories
  build_dir: path.resolve(__dirname, "../dist"),

  // Output directories
  app_output_root: path.resolve(__dirname, "../custom_components/linus_dashboard"),
  app_output_www: path.resolve(__dirname, "../custom_components/linus_dashboard/www"),

  // Source directories
  src_dir: path.resolve(__dirname, "../src"),

  // Home Assistant config for development
  config_dir: path.resolve(__dirname, "../config"),
};
