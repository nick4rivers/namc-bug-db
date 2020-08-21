/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-nocheck
// webpack.override.js
const webpack = require('webpack')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const webpackCFG = require('react-scripts/config/webpack.config')

const appPack = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')).toString())

// the default react-scripts webpack config is pretty good
// but our submodules don't have certain things so we need a bit of customization
module.exports = (webpackConfig, env) => {
	// call dotenv and it will return an Object with a parsed key
	const _env = {
		// This is the shared config
		...dotenv.config({ path: path.join(__dirname, 'app', '.env') }).parsed,
		// here is the specific config
		...dotenv.config({ path: path.join(__dirname, 'app', '.env.development') }).parsed
	}
	_env['REACT_APP_VERSION'] = appPack.version
	// reduce it to a nice object, the same as before
	const envKeys = Object.keys(_env).reduce((prev, next) => {
		prev[`process.env.${next}`] = JSON.stringify(_env[next])
		return prev
	}, {})

	console.log('_env', _env)
	const newConfig = webpackCFG('development')

	return {
		...newConfig,
		plugins: [
			// new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|de|cz|eu)$/),
			new webpack.DefinePlugin(envKeys),
			...newConfig.plugins
		]
	}
}
