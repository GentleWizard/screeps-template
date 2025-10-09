import path from "path";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const isProd = process.env.NODE_ENV === "production";

export default {
    input: "src/index.ts",
    plugins: [
        resolve({ extensions: [".ts", ".js"] }),
        commonjs(),
        typescript({ tsconfig: "./tsconfig.json" }),
        isProd ? terser() : null,
    ].filter(Boolean),
    output: {
        file: path.resolve("dist", "main.js"),
        format: "iife",
        sourcemap: !isProd,
    },
};
