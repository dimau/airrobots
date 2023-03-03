const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    watchFiles: path.join(__dirname, 'src'),
    open: true,
    hot: true,
    port: 8080,
  },
});