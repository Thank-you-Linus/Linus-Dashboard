module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: "3.37",
          bugfixes: true,
          shippedProposals: true,
        }
      ]
    ],
    plugins: [
      ["@babel/plugin-transform-runtime", { version: "^7.24.7" }],
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-private-methods",
    ],
    assumptions: {
      privateFieldsAsProperties: true,
      setPublicClassFields: true,
      setSpreadProperties: true,
    },
  };
};
