/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
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
                test: /\.(svg|woff|woff2|jpg|jpeg|png|ttf|eot)$/,
                type: 'asset/resource', // 使用asset/resource来替代url-loader
                generator: {
                    filename: 'images/[hash][ext][query]', // 使用generator来指定输出文件的名称
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
            favicon: resolve(__dirname, './favicon.ico'),
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
            Buffer: ['buffer', 'Buffer'],
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
