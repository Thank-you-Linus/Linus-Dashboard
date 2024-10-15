// noinspection JSUnusedGlobalSymbols

import path from 'path';
import webpack from 'webpack';

const config: webpack.Configuration = {
  entry: "./src/mushroom-strategy.ts",
  mode: "development",
  devtool: "source-map",
  output: {
    filename: "linus-strategy.js",
    path: path.resolve("./custom_components/linus_dashboard", "js"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};

export default config;
