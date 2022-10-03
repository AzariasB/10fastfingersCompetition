const common = require("./webpack.common.js");

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
