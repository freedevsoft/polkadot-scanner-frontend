/*
 * @ author freedevsoft
 * @ github  https://github.com/freedevsoft
 * @ use development
 */
const webpack = require("webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = {
  output: {
    filename: "assets/js/[name].js",
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    open: true,
    stats: "normal",
    contentBase: "./src/",
    compress: true,
    // host: require('ip').address(),
    port: 8005,
    overlay: {
      errors: true,
      warnings: false,
    },
    proxy: {
      "/api/*": {
        target: "http://localhost:3000",
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
};
