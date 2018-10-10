const generalConfig = require('./general.config');
const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

env = 'production'
console.log('NODE_ENV: ' + env)

const ROOT_DIR = path.join(__dirname, '..')
const BUILD_DIR = path.join(ROOT_DIR, 'build')

const config = merge(generalConfig, {
    mode: 'production',
    devtool: 'source-map',
    cache: false,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(env),
            },
        }),
        new CleanWebpackPlugin(
            [BUILD_DIR],
            {
                root: ROOT_DIR,
                verbose: true,
                dry: false
            }
        ),
        new UglifyJsPlugin({
            sourceMap: true
        }),
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: {
                                removeAll: true
                            }
                        }
                    ]
                },
                canPrint: true
            })
        ]
    }
});


module.exports = config