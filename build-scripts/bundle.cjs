const path = require('path');
const { existsSync } = require('fs');
const { rspack } = require('@rspack/core');

const isProdBuild = () => process.env.NODE_ENV === 'production' || isStatsBuild();
const isStatsBuild = () => process.env.STATS === '1' || process.env.STATS?.toLowerCase() === 'true';
const isDevBuild = () => !isProdBuild();

// Home Assistant style bundle configuration
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
    name: name + (latestBuild ? '-modern' : '-legacy'),
    mode: prodMode ? 'production' : 'development',
    target: latestBuild ? ['web', 'es2020'] : ['web', 'es5'],
    devtool: isTestBuild
      ? false
      : prodMode
      ? 'nosources-source-map'
      : 'eval-cheap-module-source-map',
    entry,

    output: {
      path: outputPath,
      publicPath,
      filename: ({ chunk }) =>
        !prodMode || statsMode || dontHash.has(chunk.name)
          ? '[name].js'
          : '[name].[contenthash:8].js',
      chunkFilename: prodMode && !statsMode ? '[name].[contenthash:8].js' : '[name].js',
      assetModuleFilename: prodMode && !statsMode ? '[hash:8][ext][query]' : '[name][ext][query]',
      clean: prodMode,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    module: {
      rules: [
        {
          test: /\.([jt]sx?|mjs)$/,
          exclude: /node_modules[\\/]core-js/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                compact: false,
                assumptions: {
                  privateFieldsAsProperties: true,
                  setPublicClassFields: true,
                  setSpreadProperties: true,
                },
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'usage',
                      corejs: '3.37',
                      bugfixes: true,
                      shippedProposals: true,
                      targets: latestBuild ? 'defaults' : 'ie 11',
                    },
                  ],
                ],
                plugins: [
                  ['@babel/plugin-transform-runtime', { version: '^7.24.7' }],
                  '@babel/plugin-transform-class-properties',
                  '@babel/plugin-transform-private-methods',
                ].filter(Boolean),
                cacheDirectory: !prodMode,
                cacheCompression: false,
              },
            },
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  loose: true,
                  externalHelpers: false,
                  target: latestBuild ? 'es2020' : 'es5',
                  parser: {
                    syntax: 'typescript',
                    decorators: true,
                  },
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          type: 'asset/source',
        },
        {
          test: /\.md$/,
          use: 'ignore-loader',
        },
      ],
    },

    optimization: {
      minimize: prodMode,
      minimizer: prodMode
        ? [
            new rspack.SwcJsMinimizerRspackPlugin({
              format: {
                comments: false,
              },
            }),
          ]
        : [],
      moduleIds: prodMode && !statsMode ? 'deterministic' : 'named',
      chunkIds: prodMode && !statsMode ? 'deterministic' : 'named',
      splitChunks: {
        chunks: !prodMode ? new RegExp(`^(?!(${Object.keys(entry).join('|')})$)`) : 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },

    plugins: [
      new rspack.DefinePlugin({
        __DEV__: !prodMode,
        __BUILD__: JSON.stringify(latestBuild ? 'modern' : 'legacy'),
        __VERSION__: JSON.stringify('1.2.4'), // Should be read from package.json
        __STATIC_PATH__: JSON.stringify('/static/'),
        'process.env.NODE_ENV': JSON.stringify(prodMode ? 'production' : 'development'),
        ...defineOverlay,
      }),

      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1, // Like Home Assistant, keep everything in one chunk for custom components
      }),

      // Progress plugin for development
      !prodMode && new rspack.ProgressPlugin(),
    ].filter(Boolean),

    stats: {
      errorDetails: true,
      colors: true,
      modules: false,
      chunks: false,
      chunkModules: false,
    },

    experiments: {
      outputModule: latestBuild,
    },
  };
};

module.exports = {
  createBundleConfig,
  isProdBuild,
  isStatsBuild,
  isDevBuild,
};
