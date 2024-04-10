/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const { resolve } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBarPlugin = require('webpackbar');

let entryFile = '';
if (fs.existsSync('./src/index.tsx')) {
    entryFile = './src/index.tsx';
} else {
    entryFile = './src/index.ts';
}

module.exports = {
    entry: resolve(entryFile),
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    experimentalWatchApi: true,
                },
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },

            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            },
                        },
                    },
                ],
            },
            // 解析url
            {
                test: /\.(svg|woff|woff2|jpg|png|ttf|eot)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: 'images/[hash].[ext]',
                        limit: 1024,
                    },
                },
            },
        ],
    },
    plugins: [
        new WebpackBarPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: resolve(__dirname, './index.html'),
        }),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },

    devServer: {
        host: 'localhost',
        compress: true,
        static: {
            directory: resolve(__dirname, '../'),
        },
        port: 8000,
    },
};
