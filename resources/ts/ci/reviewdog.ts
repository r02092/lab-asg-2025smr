import {spawn} from "child_process";
import fs from "fs";
import {ESLint} from "eslint";
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
	code: {value: string | null; url: string};
	original_output: string;
};
(async () => {
	const gitDiff = spawn("git", ["diff", "--name-only", "FETCH_HEAD"], {
		stdio: ["ignore", "pipe", "inherit"],
	});
	const diff = await new Promise<string[]>(resolve => {
		gitDiff.stdout.on("data", data => {
			resolve(
				data
					.toString()
					.split("\n")
					.filter((f: string) => fs.existsSync(f)),
			);
		});
	});
	const podmanArgs = ["exec", "-i", "lab-asg-2025smr_app_1"];
	const eslint = new ESLint();
	const formatter = await eslint.loadFormatter("eslint-formatter-rdjson");
	const diagnostics = JSON.parse(
		await formatter.format(await eslint.lintFiles(diff)),
	).diagnostics.filter((d: RdJsonDiagnostic) => d.code.value !== null);
	const phpstan = spawn(
		process.env.GITHUB_ACTIONS ? "vendor/bin/phpstan" : "podman",
		(process.env.GITHUB_ACTIONS
			? []
			: podmanArgs.concat("vendor/bin/phpstan")
		).concat(["analyse", ...diff, "--error-format=raw", "--no-progress"]),
		{stdio: ["pipe", "pipe", "inherit"]},
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
					code: {value: null, url: ""},
					original_output: l,
				});
		}
		diagnostics.push(...PsDiagnostics);
		dataCnt--;
	});
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
		{
			...(process.env.GITHUB_ACTIONS
				? {env: {...process.env, REVIEWDOG_GITHUB_API_TOKEN: process.argv[2]}}
				: {}),
			stdio: ["pipe", "inherit", "inherit"],
		},
	);
	reviewdog.stdin.write(
		JSON.stringify({
			diagnostics: await Promise.all(
				diagnostics.map(async (d: RdJsonDiagnostic) => {
					if (!d.code || !d.code.url.startsWith("https://markuplint.dev/")) {
						d.message +=
							(process.env.GITHUB_ACTIONS
								? "\n**日本語訳**: "
								: "\n日本語訳: ") +
							(await (
								await fetch(
									"https://script.google.com/macros/s/AKfycbyhf7DYTLazRge-LQaBw_6S656frZyz0gBCqQB_Hkf_zQsjHvl2hdqDgQtiypjLP3Fv/exec?t=" +
										encodeURIComponent(d.message),
								)
							).text());
					}
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
						(process.env.GITHUB_ACTIONS
							? d.severity
							: d.severity.padEnd(9, " ")) +
						" " +
						d.message;
					return d;
				}),
			),
		}),
	);
	reviewdog.stdin.end();
	reviewdog.on("exit", code => {
		process.exit(code ?? 0);
	});
})();
