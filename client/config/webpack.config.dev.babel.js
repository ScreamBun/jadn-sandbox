const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const DeadCodePlugin = require('webpack-deadcode-plugin');

const baseConfig = require('./webpack.config.base');

const NODE_ENV = 'development';

const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src', 'components');
const DEPEND_DIR = path.join(COMPONENTS_DIR, 'dependencies');


module.exports = merge(baseConfig, {
  mode: NODE_ENV,
  devtool: 'eval',
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV
    }),
    new DeadCodePlugin({
      patterns: [
        'src/**/*.(js|jsx|css|less)'
      ],
      exclude: [
        '**/*.(stories|spec).(js|jsx)$',
        DEPEND_DIR
      ]
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  devServer: {
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8082',
        secure: false,
        changeOrigin: true
      }
    },
    static: {
      directory: BUILD_DIR
    }
  },
  optimization: {
    usedExports: true
  }
});
