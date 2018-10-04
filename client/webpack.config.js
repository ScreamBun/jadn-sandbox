/*
npm install babel-loader babel-core babel-preset-env babel-preset-react --save-dev
npm install css-loader file-loader less less-loader style-loader svg-inline-loader --save-dev
npm install react-hot-loader --save-dev
npm install webpack webpack-dev-server --save-dev
npm install html-webpack-plugin clean-webpack-plugin --save-dev
npm install --save-dev html-webpack-externals-plugin
*/
var webpack = require('webpack'),
    path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const BundleTracker = require('webpack-bundle-tracker');

const env = process.env.NODE_ENV
console.log('NODE_ENV: ' + env)

const BUILD_DIR = path.join(__dirname, 'build')

var config  = {
    entry: path.join(__dirname, 'src', 'index.js'),
    output: {
        path: BUILD_DIR,
        publicPath: '/',
        filename: 'js/[name].bundle.js'
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules')
        ]
    },
    plugins: [
        new BundleTracker({filename: './webpack.stats.json'}),
        new HtmlWebpackPlugin({
            title: 'HtmlWebpackPlugin',
            filename: 'index.html',
            template: './src/components/dependencies/index.html'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
            moment: 'moment'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        }),
        new ExtractTextPlugin("css/[name].bundle.css", {
            allChunks: true
        }),
        new FaviconsWebpackPlugin({
            logo: './src/components/dependencies/img/jadn-favicon.png',
            prefix: 'img/favicons/',
            statsFilename: 'favicons-[hash].json',
            persistentCache: true,
            inject: true,
            background: '#ffffff',
            title: 'Orchestrator UI',
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: false,
                coast: false,
                favicons: true,
                firefox: false,
                opengraph: false,
                twitter: false,
                yandex: false,
                windows: false
            }
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'build'),
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
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'react']
                    }
                }
            },{
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader'
                    ]
                })
            },{
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'less-loader'
                    ]
                })
            },{
                test: /\.(svg|jpeg|jpg|gif|bmp|tiff|png)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name].[ext]'
                    }
                }]
            },{
                test: /\.(ttf|eot|woff|woff2)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'css/fonts/[name].[ext]'
                    }
                }]
            }
        ]
    }
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
        new CleanWebpackPlugin([BUILD_DIR]),
        new webpack.optimize.UglifyJsPlugin()
    )
}


module.exports = config