const fs = require("fs");
const path = require("path");

const isTrue = (value) => value === "1" || value?.toLowerCase() === "true";

module.exports = {
  isProdBuild() {
    return process.env.NODE_ENV === "production" || module.exports.isStatsBuild();
  },

  isStatsBuild() {
    return isTrue(process.env.STATS);
  },

  isTestBuild() {
    return isTrue(process.env.IS_TEST);
  },

  isDevContainer() {
    return isTrue(process.env.DEV_CONTAINER);
  },

  version() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
      );
      return packageJson.version;
    } catch (err) {
      console.warn("Could not read version from package.json, using default");
      return "dev";
    }
  },
};
