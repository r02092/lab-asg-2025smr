import {ESLint} from "eslint";
import {spawn} from "child_process";
(async () => {
	const eslint = new ESLint();
	const formatter = await eslint.loadFormatter("eslint-formatter-rdjson");
	const result = JSON.parse(
		await formatter.format(
			await eslint.lintFiles(["**/*.{js,ts,json{,5},md,css}"]),
		),
	);
	result.diagnostics = await Promise.all(
		result.diagnostics.map(async (d: any) => {
			d.message +=
				(process.env.GITHUB_ACTIONS ? "\n**日本語訳**: " : "\n日本語訳: ") +
				(await (
					await fetch(
						"https://script.google.com/macros/s/AKfycbyhf7DYTLazRge-LQaBw_6S656frZyz0gBCqQB_Hkf_zQsjHvl2hdqDgQtiypjLP3Fv/exec?t=" +
							encodeURIComponent(d.message),
					)
				).text());
			d.location.path = d.location.path
				.replace(process.cwd(), "")
				.replace(/\\/g, "/")
				.replace(/^\//, "");
			d.original_output =
				d.location.path +
				":" +
				d.location.range.start.line +
				":" +
				d.location.range.start.column +
				"\n" +
				(process.env.GITHUB_ACTIONS ? d.severity : d.severity.padEnd(9, " ")) +
				" " +
				d.message;
			return d;
		}),
	);
	const reviewdog = spawn(
		(process.env.GITHUB_ACTIONS ? "./" : "") + "reviewdog",
		["-f=rdjson"].concat(
			process.env.GITHUB_ACTIONS
				? ["-reporter=github-pr-review", "-fail-on-error"]
				: ["-diff=git diff FETCH_HEAD"],
		),
		process.env.GITHUB_ACTIONS
			? {env: {...process.env, REVIEWDOG_GITHUB_API_TOKEN: process.argv[2]}}
			: {},
	);
	reviewdog.stdin.write(JSON.stringify(result));
	reviewdog.stdin.end();
	reviewdog.stdout.pipe(process.stdout);
	reviewdog.stderr.pipe(process.stderr);
	reviewdog.on("exit", code => {
		process.exit(code ?? 0);
	});
})();
