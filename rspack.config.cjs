const path = require("path");
const { createBundleConfig } = require("./build-scripts/bundle.cjs");
const paths = require("./build-scripts/paths.cjs");
const env = require("./build-scripts/env.cjs");

const createLinusDashboardConfig = ({
  isProdBuild,
  latestBuild = true,
  isStatsBuild,
  isTestBuild
}) => {
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
    isProdBuild,
    latestBuild,
    isStatsBuild,
    isTestBuild,
    dontHash: new Set(["linus-strategy"]), // Don't hash main entry for predictable filename
  });
};

// Export configuration based on environment
const configs = [];

// Always build modern version
configs.push(
  createLinusDashboardConfig({
    isProdBuild: env.isProdBuild(),
    latestBuild: true,
    isStatsBuild: env.isStatsBuild(),
    isTestBuild: env.isTestBuild(),
  })
);

// In production, also build legacy version for older browsers
if (env.isProdBuild() && !env.isStatsBuild()) {
  configs.push(
    createLinusDashboardConfig({
      isProdBuild: env.isProdBuild(),
      latestBuild: false,
      isStatsBuild: env.isStatsBuild(),
      isTestBuild: env.isTestBuild(),
    })
  );
}

module.exports = configs.length === 1 ? configs[0] : configs;
