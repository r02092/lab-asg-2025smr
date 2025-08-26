import * as webpack from "webpack";
import * as path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import GasPlugin from "gas-webpack-plugin";
const config: webpack.Configuration[] = [
	{
		entry: "./src/main.ts",
		output: {
			path: path.resolve("dist", "js"),
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
			path: path.resolve("gas"),
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
export default config;
