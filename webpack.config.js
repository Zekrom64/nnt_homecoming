import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let api = {
	entry: './ts/main.ts',
	module: {
		rules: [
			{
				test: /\.ya?ml$/,
				use: 'js-yaml-loader'
			},
			{
				test: /\.(js|ts)x?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
								'@babel/preset-typescript'
							]
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	mode: 'production',
	optimization: {
		minimize: false
	},
	output: {
		filename: 'merged.js',
		path: resolve(__dirname, 'build/js')
	}
};

export default api;