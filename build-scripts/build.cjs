const path = require("path");
const esbuild = require("esbuild");
const env = require("./env.cjs");

const args = new Set(process.argv.slice(2));
const watch = args.has("--watch");
const prod = args.has("--prod") || process.env.NODE_ENV === "production" || env.isProdBuild();

const rootDir = path.resolve(__dirname, "..");
const entryPoint = path.resolve(rootDir, "src/linus-strategy.ts");
const outFile = path.resolve(rootDir, "custom_components/linus_dashboard/www/linus-strategy.js");

const commonOptions = {
  entryPoints: [entryPoint],
  bundle: true,
  outfile: outFile,
  format: "iife",
  platform: "browser",
  target: ["es2017"],
  sourcemap: true,
  minify: prod,
  treeShaking: true,
  legalComments: "none",
  loader: {
    ".md": "empty",
  },
  define: {
    __BUILD__: JSON.stringify(env.version()),
    __DEV__: JSON.stringify(!prod),
    __LINUS_DASHBOARD__: "true",
    __STATIC_PATH__: JSON.stringify("/static/linus_dashboard/"),
    __VERSION__: JSON.stringify(env.version()),
    "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development"),
  },
};

async function main() {
  if (watch) {
    const ctx = await esbuild.context(commonOptions);
    await ctx.watch();
    console.log(`[build] watching ${entryPoint}`);
    return;
  }

  await esbuild.build(commonOptions);
  console.log(`[build] wrote ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
