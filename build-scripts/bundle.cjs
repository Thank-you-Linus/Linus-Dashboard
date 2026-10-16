const path = require('path');
const { existsSync } = require('fs');
const { rspack } = require('@rspack/core');

const isProdBuild = () => process.env.NODE_ENV === 'production' || isStatsBuild();
const isStatsBuild = () => process.env.STATS === '1' || process.env.STATS?.toLowerCase() === 'true';
const isDevBuild = () => !isProdBuild();

// Simplified bundle configuration
const createBundleConfig = ({
  name = 'linus-dashboard',
  entry,
  outputPath,
  publicPath = '/',
  defineOverlay = {},
  isProdBuild: prodBuild,
  latestBuild = true,
  isStatsBuild: statsBuild,
  isTestBuild = false,
  dontHash = new Set(),
}) => {
  const prodMode = prodBuild ?? isProdBuild();
  const statsMode = statsBuild ?? isStatsBuild();

  return {
    name: name,
    mode: prodMode ? 'production' : 'development',
    target: ['web'],
    devtool: prodMode ? 'source-map' : 'eval-cheap-module-source-map',
    entry,

    output: {
      path: outputPath,
      publicPath,
      filename: '[name].js',
      chunkFilename: '[name].[contenthash:8].js',
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      // HA's frontend only ships to evergreen browsers that support
                      // native ES modules, so there's no need to polyfill or
                      // down-compile for legacy engines like IE11.
                      targets: { esmodules: true },
                    },
                  ],
                ],
                plugins: [
                  '@babel/plugin-transform-class-properties',
                  '@babel/plugin-transform-private-methods',
                ],
              },
            },
            'builtin:swc-loader',
          ],
        },
        {
          test: /\.md$/,
          use: 'ignore-loader',
        },
      ],
    },

    optimization: {
      minimize: prodMode,
      // Only split the dynamic import() points already used in src/ (views,
      // cards, chips are loaded on demand via componentRegistry/utils.ts).
      // The entry point itself still ships as a single synchronous chunk.
      splitChunks: {
        chunks: 'async',
      },
    },

    plugins: [
      new rspack.DefinePlugin({
        __DEV__: !prodMode,
        __VERSION__: JSON.stringify('1.2.4'),
        'process.env.NODE_ENV': JSON.stringify(prodMode ? 'production' : 'development'),
        ...defineOverlay,
      }),
    ],

    stats: {
      colors: true,
      modules: false,
      chunks: false,
    },
  };
};

module.exports = {
  createBundleConfig,
  isProdBuild,
  isStatsBuild,
  isDevBuild,
};
