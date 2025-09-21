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
    target: ['web', 'es5'],
    devtool: prodMode ? 'source-map' : 'eval-cheap-module-source-map',
    entry,

    output: {
      path: outputPath,
      filename: '[name].js',
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
                      targets: 'ie 11', // Maximum compatibility
                      useBuiltIns: 'usage',
                      corejs: '3.37',
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
      // Disable all chunk splitting - everything in one file
      splitChunks: {
        chunks: 'async',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      },
    },

    plugins: [
      new rspack.DefinePlugin({
        __DEV__: !prodMode,
        __VERSION__: JSON.stringify('1.2.4'),
        'process.env.NODE_ENV': JSON.stringify(prodMode ? 'production' : 'development'),
        ...defineOverlay,
      }),

      // Keep everything in one chunk like your Webpack config
      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
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
