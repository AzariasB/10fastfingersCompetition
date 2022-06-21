const path = require("path");

module.exports = {
  entry: {
    options: path.join(__dirname, "../src/options.ts"),
    background: path.join(__dirname, "../src/background.ts"),
  },
  output: {
    globalObject: "this",
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
