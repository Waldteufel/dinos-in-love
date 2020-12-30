module.exports = (_, argv) => ({
  entry: './src/index.js',
  mode: argv.mode ?? 'development',
  devtool: 'source-map',
  stats: 'minimal',
  devServer: {
    publicPath: '/dist/'
  }
});
