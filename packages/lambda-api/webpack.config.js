/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')
const webpack = require('webpack')

const SRC_DIR = path.resolve(__dirname, 'dist')
const OUT_DIR = path.resolve(__dirname, '.webpack')

// Get all the candidates for packing
const entry = fs
    .readdirSync(SRC_DIR)
    .filter((fname) => fname.match(/^lambda_.*\.js$/))
    .reduce((acc, fname) => ({ ...acc, [fname.split('.')[0]]: path.resolve(SRC_DIR, fname) }), {})

console.log(entry)

const config = {
    mode: 'production',
    entry,
    // aws-sdk is already available in the Node.js Lambda environment
    //  so it should not be included in function bundles
    externals: ['aws-sdk'],
    plugins: [
        new webpack.IgnorePlugin(/^pg-native$/),
        new webpack.DefinePlugin({
            'process.env.VERSION': JSON.stringify(require('./package.json').version)
        })
    ],
    output: {
        path: OUT_DIR,
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd'
    },
    target: 'node'
}

module.exports = config
