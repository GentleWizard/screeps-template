import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		entry: "src/main.ts",
		format: "cjs",
		outDir: "dist",
		platform: "neutral",
		minify: true,
	},
	fmt: { printWidth: 100, tabWidth: 4, useTabs: true },
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
	resolve: { alias: { "@": "/src" } },
});
