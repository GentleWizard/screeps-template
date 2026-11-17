import { readFile } from "node:fs/promises";

const token = process.env.SCREEPS_TOKEN;

if (!token) {
	console.error("Missing SCREEPS_TOKEN environment variable.");
	process.exit(1);
}

const apiUrl = process.env.SCREEPS_API_URL ?? "https://screeps.com";
const branch = process.env.SCREEPS_BRANCH ?? "default";
const code = await readFile("dist/main.cjs", "utf8");

const res = await fetch(`${apiUrl}/api/user/code`, {
	method: "POST",
	headers: { "Content-Type": "application/json", "X-Token": token },
	body: JSON.stringify({ branch, modules: { main: code } }),
});

const body = await res.text();
if (!res.ok) {
	console.error(`Upload failed (${res.status}): ${body}`);
	process.exit(1);
}

console.log(`Uploaded to ${apiUrl} branch "${branch}": ${body}`);
