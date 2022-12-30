/**
 * Base webpack config used across other specific configs
 */
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const WorkboxPlugin = require("workbox-webpack-plugin");

const NODE_ENV = 'production';

const ROOT_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src', 'components');
const DEPEND_DIR = path.join(COMPONENTS_DIR, 'dependencies');

const commonImages = /\.(?:bmp|ico|gif|png|jpe?g|tiff|webp)$/;

const file_loader = {
  loader: 'file-loader',
  options: {
    name: (rPath, rQuery) => {
      const ext = path.extname(rPath);
      if (commonImages.test(ext)) {
        return 'img/[name].[ext]';
      }
      return 'assets/[ext]/[name].[ext]';
    }
  }
};

const loader = {
  css: {
    loader: 'css-loader',
    options: {
      url: true,
      import: true
    }
  },
  file: file_loader,
  less: {
    loader: 'less-loader',
    options: {
      lessOptions: {
        strictMath: true
      }
    }
  },
  url: {
    loader: 'url-loader',
    options: {
      limit: 10 * 1024,
      fallback: file_loader
    }
  }
};

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    main: './src/index.jsx'
  },
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    filename: 'js/[name].bundle.min.js'
  },
  context: ROOT_DIR,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['node_modules', path.join(ROOT_DIR, 'src')]
  },
  performance: {
    hints: false
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(DEPEND_DIR, 'index.html')
    }),
    new MiniCssExtractPlugin()
    // new WorkboxPlugin.GenerateSW({
    //   swDest: "service-worker.js",
    //   clientsClaim: true,
    //   skipWaiting: true
    // })
  ],
  optimization: {
    mergeDuplicateChunks: true,
    runtimeChunk: false,
    splitChunks: {
      automaticNameDelimiter: '_',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        utils: {
          test: /components\/(static|utils)[\\/]/,
          name: 'utils',
          chunks: 'all'
        }
      }
    }
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'svg-url-loader',
        options: {
          limit: 10 * 1024,
          noquotes: true,
          fallback: loader.file
        }
      },
      { 
        test: commonImages,
        use: loader.url
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
};
