const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const baseConfig = require('./webpack.config.base');

const NODE_ENV = 'production';

const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src', 'components');
const DEPEND_DIR = path.join(COMPONENTS_DIR, 'dependencies');

module.exports = merge(baseConfig, {
  mode: NODE_ENV,
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
      openAnalyzer: false,
      statsFilename: path.join(ROOT_DIR, 'analyzer.stats.json'),
      reportFilename: path.join(ROOT_DIR, 'analyzer.stats.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.min.css',
      chunkFilename: 'css/[name].bundle.min.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { // Custom Assets
          from: path.join(DEPEND_DIR, 'assets'),
          to: path.join(BUILD_DIR, 'assets'),
          toType: 'dir'
        },
      ]
    }),
    new CleanWebpackPlugin({
      dry: false
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: true
      })
    ]
  }
});
