/*
npm install babel-loader babel-core babel-preset-env babel-preset-react --save-dev
npm install css-loader file-loader less less-loader style-loader svg-inline-loader --save-dev
npm install react-hot-loader --save-dev
npm install webpack webpack-dev-server --save-dev
npm install html-webpack-plugin clean-webpack-plugin --save-dev
npm install --save-dev html-webpack-externals-plugin
*/
const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const BundleTracker = require('webpack-bundle-tracker');

const ROOT_DIR = path.join(__dirname, '..')
const BUILD_DIR = path.join(ROOT_DIR, 'build')
const DEPEND_DIR = path.join(ROOT_DIR, 'src', 'components', 'dependencies')

const config  = {
    mode: 'none',
    devtool: 'inline-source-map',
    entry: path.join(ROOT_DIR, 'src', 'index.js'),
    output: {
        path: BUILD_DIR,
        publicPath: '',
        filename: 'js/[name].bundle.min.js'
    },
    context: ROOT_DIR,
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
            path.join(ROOT_DIR, 'node_modules')
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'HtmlWebpackPlugin',
            filename: 'index.html',
            template: './src/components/dependencies/index.html'
        }),
        new BundleTracker({
            filename: './webpack.stats.json'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
            moment: 'moment'
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].bundle.min.css",
            chunkFilename: "css/[name].bundle.min.css",
            allChunks: true
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(DEPEND_DIR, 'assets'),
                to: path.join(BUILD_DIR, 'assets'),
                toType: 'dir'
            }
        ]),
        new FaviconsWebpackPlugin({
            logo: path.join(DEPEND_DIR, 'img', 'jadn-favicon.png'),
            prefix: 'img/favicons/',
            statsFilename: 'favicons-[hash].json',
            persistentCache: true,
            inject: true,
            background: '#ffffff',
            title: 'JADN Lint',
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: true,
                coast: false,
                favicons: true,
                firefox: true,
                opengraph: false,
                twitter: false,
                yandex: false,
                windows: true
            }
        })
    ],
    devServer: {
        contentBase: BUILD_DIR,
        compress: true,
        port: 3000,
        hot: true,
        open: false,
        historyApiFallback: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                //pathRewrite: {"^/api/v1" : ""},
                secure: false
            }
        }
    },
    optimization: {
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                }
            }
        },
        minimizer: []
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                         presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-object-rest-spread'
                        ]
                    }
                }
            },{
                test: /\.(c|le)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                            alias: {
                                './fonts': path.resolve(DEPEND_DIR, 'css', 'fonts')
                            }
                        }
                    },
                    'less-loader'
                ]
            },{
                test: /\.(svg|jpe?g|gif|bmp|tiff|png|ico)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 25000,
                        fallback: {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/img/[name].[ext]'
                            }
                        }
                    },
                }]
            }
        ]
    }
};


module.exports = config