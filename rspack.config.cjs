const path = require("path");
const { createBundleConfig } = require("./build-scripts/bundle.cjs");
const paths = require("./build-scripts/paths.cjs");
const env = require("./build-scripts/env.cjs");

// Simple configuration matching your working Webpack setup
const createLinusDashboardConfig = () => {
  return createBundleConfig({
    name: "linus-dashboard",
    entry: {
      "linus-strategy": path.resolve(paths.src_dir, "linus-strategy.ts"),
    },
    outputPath: paths.app_output_www,
    publicPath: "/static/linus_dashboard/",
    defineOverlay: {
      __LINUS_DASHBOARD__: true,
      __VERSION__: JSON.stringify(env.version()),
    },
    isProdBuild: env.isProdBuild(),
    latestBuild: false, // Always use legacy for compatibility
    isStatsBuild: env.isStatsBuild(),
    isTestBuild: env.isTestBuild(),
    dontHash: new Set(["linus-strategy"]),
  });
};

module.exports = createLinusDashboardConfig();
