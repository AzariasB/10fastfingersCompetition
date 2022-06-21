const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");

module.exports = {
  ...common,
  ...{
    devtool: "inline-source-map",
    mode: "development",
    watchOptions: {
      poll: true,
      ignored: /node_modules/,
    },
  },
};
