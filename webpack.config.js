/* eslint-env node */

const webpack = require('webpack');

module.exports = (env, argv) => ({
  entry: './src/index.js',
  mode: argv.mode ?? 'development',
  devtool: 'source-map',
  stats: 'minimal'
});
