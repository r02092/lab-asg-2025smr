const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const GasPlugin = require("gas-webpack-plugin");
module.exports = [
	{
		entry: "./src/main.ts",
		output: {
			path: path.resolve(__dirname, "dist", "js"),
			filename: "main.js",
		},
		resolve: {
			extensions: [".js", ".ts"],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: "ts-loader",
				},
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, "css-loader"],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: "../css/[name].css",
			}),
		],
		watchOptions: {
			ignored: /node_modules/,
		},
	},
	{
		entry: "./src/ci/gas.ts",
		output: {
			path: path.resolve(__dirname, "gas"),
			filename: "main.js",
		},
		resolve: {
			extensions: [".js", ".ts"],
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: "ts-loader",
				},
			],
		},
		plugins: [new GasPlugin()],
		watchOptions: {
			ignored: /node_modules/,
		},
	},
];
