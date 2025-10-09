import { readdir } from "node:fs/promises";
import { join, extname } from "node:path";

interface ServerConfig {
    host: string;
    port?: number;
    secure?: boolean;
    secretEnv: string;
    branch?: string; // optional: override screeps branch name
}

interface DeployConfig {
    [gitBranch: string]: ServerConfig;
}

interface ScreepsAuthResponse {
    ok: number;
    token?: string;
    data?: {
        token?: string;
    };
}

interface ScreepsUploadResponse {
    ok: number;
    timestamp?: number;
}

interface ScreepsModules {
    [moduleName: string]: string;
}

class DeployError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly responseBody?: string
    ) {
        super(message);
        this.name = "DeployError";
    }
}

async function readText(path: string): Promise<string> {
    try {
        return await Bun.file(path).text();
    } catch (err) {
        throw new DeployError(
            `Failed to read ${path}: ${
                err instanceof Error ? err.message : String(err)
            }`
        );
    }
}

function makeBaseUrl(server: ServerConfig): string {
    const proto = server.secure === false ? "http" : "https";
    const port = server.port ?? (server.secure === false ? 80 : 443);
    const isDefaultPort =
        (proto === "https" && port === 443) ||
        (proto === "http" && port === 80);
    return isDefaultPort
        ? `${proto}://${server.host}`
        : `${proto}://${server.host}:${port}`;
}

async function getTokenForServer(
    server: ServerConfig,
    apiBase: string
): Promise<string> {
    // Priority: server-specific token > global token > email/password auth
    if (server.secretEnv && process.env[server.secretEnv]) {
        console.log(`✓ Using token from ${server.secretEnv}`);
        return process.env[server.secretEnv]!;
    }

    if (process.env.SCREEPS_TOKEN) {
        console.log("✓ Using global SCREEPS_TOKEN");
        return process.env.SCREEPS_TOKEN;
    }

    const email = process.env.SCREEPS_EMAIL;
    const password = process.env.SCREEPS_PASSWORD;

    if (!email || !password) {
        throw new DeployError(
            `No token found. Provide ${server.secretEnv}, SCREEPS_TOKEN, or SCREEPS_EMAIL & SCREEPS_PASSWORD`
        );
    }

    console.log(`→ Authenticating with email/password to ${apiBase}`);

    const res = await fetch(`${apiBase}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new DeployError(`Authentication failed`, res.status, txt);
    }

    const json = (await res.json()) as ScreepsAuthResponse;
    const token = json.token || json.data?.token;

    if (!token) {
        throw new DeployError(
            "Token not found in signin response",
            undefined,
            JSON.stringify(json)
        );
    }

    console.log("✓ Authenticated successfully");
    return token;
}

async function collectModules(distPath: string): Promise<ScreepsModules> {
    const modules: ScreepsModules = {};

    try {
        const entries = await readdir(distPath, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isFile()) continue;

            const ext = extname(entry.name);
            if (ext !== ".js" && ext !== ".mjs") continue;

            const fullPath = join(distPath, entry.name);
            const content = await readText(fullPath);

            // Use filename without extension as module name
            const moduleName = entry.name.replace(/\.(m)?js$/, "");
            modules[moduleName] = content;

            console.log(`  • ${entry.name} → ${moduleName}`);
        }

        if (Object.keys(modules).length === 0) {
            throw new DeployError(`No .js or .mjs files found in ${distPath}`);
        }

        return modules;
    } catch (err) {
        if (err instanceof DeployError) throw err;
        throw new DeployError(
            `Failed to collect modules from ${distPath}: ${
                err instanceof Error ? err.message : String(err)
            }`
        );
    }
}

async function uploadCode(
    apiBase: string,
    token: string,
    branch: string,
    modules: ScreepsModules
): Promise<ScreepsUploadResponse> {
    console.log(
        `→ Uploading ${
            Object.keys(modules).length
        } module(s) to ${apiBase} branch="${branch}"`
    );

    const res = await fetch(`${apiBase}/api/user/code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Token": token,
            "X-Username": token, // some servers expect this as well
        },
        body: JSON.stringify({ branch, modules }),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new DeployError(`Upload failed`, res.status, txt);
    }

    return (await res.json()) as ScreepsUploadResponse;
}

async function main(): Promise<void> {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Screeps Deploy Script");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Load configuration
    const cfgText = await readText("deploy-config.json");
    const config = JSON.parse(cfgText) as DeployConfig;

    // Determine branch
    const branchFromEnv = process.env.SCREEPS_TARGET_BRANCH;
    const githubBranch = process.env.GITHUB_REF_NAME;
    const gitBranch = branchFromEnv || githubBranch || "default";

    console.log(`Git branch: ${gitBranch}`);

    // Get server config for this branch
    const server = config[gitBranch] || config.default;

    if (!server) {
        const available = Object.keys(config)
            .filter((k) => k !== "default")
            .join(", ");
        throw new DeployError(
            `No server mapping for branch "${gitBranch}" and no default configured.\nAvailable: ${available}`
        );
    }

    const apiBase = makeBaseUrl(server);
    const screepsBranch = server.branch || gitBranch;

    console.log(`Target server: ${apiBase}`);
    console.log(`Screeps branch: ${screepsBranch}\n`);

    // Authenticate
    const token = await getTokenForServer(server, apiBase);

    // Collect modules from dist
    console.log("\nCollecting modules from dist/");
    const modules = await collectModules("dist");

    // Upload
    console.log("");
    const result = await uploadCode(apiBase, token, screepsBranch, modules);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✓ Deploy successful!");
    if (result.timestamp) {
        console.log(`  Timestamp: ${new Date(result.timestamp).toISOString()}`);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((err: unknown) => {
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("✗ Deploy failed!\n");

    if (err instanceof DeployError) {
        console.error(`Error: ${err.message}`);
        if (err.statusCode) {
            console.error(`Status: ${err.statusCode}`);
        }
        if (err.responseBody) {
            console.error(`Response: ${err.responseBody}`);
        }
    } else if (err instanceof Error) {
        console.error(`Error: ${err.message}`);
        console.error(err.stack);
    } else {
        console.error("Unknown error:", err);
    }

    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(1);
});
