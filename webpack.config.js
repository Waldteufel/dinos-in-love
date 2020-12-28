/* eslint-env node */

const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(ttf|woff2|png)$/,
        use: [{
          loader: "file-loader",
          options: {
            name: "[name].[ext]?[hash]"
          }
        }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'JS Game', template: './src/index.html' }),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false
    })
  ]
};