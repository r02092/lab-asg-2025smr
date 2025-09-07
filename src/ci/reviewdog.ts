import {ESLint} from "eslint";
import {spawn} from "child_process";
type RdJsonDiagnostic = {
	message: string;
	location: {
		path: string;
		range: {
			start: {line: number; column?: number};
			end?: {line: number; column?: number};
		};
	};
	severity: string;
	code?: {value: string; url: string};
	original_output: string;
};
async function processDiagnostics(
	diagnostics: RdJsonDiagnostic[],
): Promise<RdJsonDiagnostic[]> {
	return Promise.all(
		diagnostics.map(async (d: RdJsonDiagnostic) => {
			d.message +=
				(process.env.GITHUB_ACTIONS ? "\n**日本語訳**: " : "\n日本語訳: ") +
				(await (
					await fetch(
						"https://script.google.com/macros/s/AKfycbyhf7DYTLazRge-LQaBw_6S656frZyz0gBCqQB_Hkf_zQsjHvl2hdqDgQtiypjLP3Fv/exec?t=" +
							encodeURIComponent(d.message),
					)
				).text());
			d.location.path = d.location.path
				.replace("mnt/repo/", "")
				.replace(process.cwd(), "")
				.replace(/\\/g, "/")
				.replace(/^\//, "");
			d.original_output =
				d.location.path +
				":" +
				d.location.range.start.line +
				(d.location.range.start.column
					? ":" + d.location.range.start.column
					: "") +
				"\n" +
				(process.env.GITHUB_ACTIONS ? d.severity : d.severity.padEnd(9, " ")) +
				" " +
				d.message;
			return d;
		}),
	);
}
(async () => {
	const podmanArgs = ["exec", "-i", "lab-asg-2025smr_app_1"];
	const eslint = new ESLint();
	const formatter = await eslint.loadFormatter("eslint-formatter-rdjson");
	const result = JSON.parse(
		await formatter.format(
			await eslint.lintFiles(["**/*.{js,ts,json{,5},md,css}"]),
		),
	);
	const diagnostics = await processDiagnostics(result.diagnostics);
	const phpstan = spawn(
		process.env.GITHUB_ACTIONS ? "vendor/bin/phpstan" : "podman",
		(process.env.GITHUB_ACTIONS
			? []
			: podmanArgs.concat("vendor/bin/phpstan")
		).concat(["analyse", "--error-format=raw", "--no-progress"]),
	);
	let dataCnt = 0;
	phpstan.stdout.on("data", data => {
		dataCnt++;
		const PsDiagnostics: RdJsonDiagnostic[] = [];
		for (const l of data.toString().split("\n")) {
			const m = l.match(/^(.*\.php):(\d+):(.*)$/);
			if (m)
				PsDiagnostics.push({
					message: m[3],
					location: {
						path: m[1],
						range: {
							start: {line: parseInt(m[2])},
						},
					},
					severity: "ERROR",
					original_output: l,
				});
		}
		processDiagnostics(PsDiagnostics).then(ds => {
			diagnostics.push(...ds);
			dataCnt--;
		});
	});
	phpstan.stderr.pipe(process.stderr);
	await new Promise<void>(resolve => {
		phpstan.on("exit", () => {
			resolve();
		});
	});
	while (dataCnt) await new Promise(r => setTimeout(r, 99));
	const reviewdog = spawn(
		process.env.GITHUB_ACTIONS ? "./reviewdog" : "podman",
		process.env.GITHUB_ACTIONS
			? ["-f=rdjson", "-reporter=github-pr-review", "-fail-on-error"]
			: podmanArgs.concat([
					"reviewdog",
					"-f=rdjson",
					"-diff=git diff FETCH_HEAD",
				]),
		process.env.GITHUB_ACTIONS
			? {env: {...process.env, REVIEWDOG_GITHUB_API_TOKEN: process.argv[2]}}
			: {},
	);
	reviewdog.stdin.write(JSON.stringify({diagnostics: diagnostics}));
	reviewdog.stdin.end();
	reviewdog.stdout.pipe(process.stdout);
	reviewdog.stderr.pipe(process.stderr);
	reviewdog.on("exit", code => {
		process.exit(code ?? 0);
	});
})();
