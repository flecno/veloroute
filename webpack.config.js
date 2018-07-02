const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  devtool: "cheap-eval-source-map",
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.html$/,
        loader: "underscore-template-loader",
        query: {
          root: "myapp",
          parseDynamicRoutes: true
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "base.css"
    }),
    new HtmlWebpackPlugin({
      template: "main.html",
      minify: true,
      hash: true
    })
  ]
};
