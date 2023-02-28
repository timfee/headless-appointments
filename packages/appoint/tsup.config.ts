import { defineConfig } from "tsup"

const commonConfig = {
  clean: true,
  splitting: false,
  dts: true,
  sourcemap: true,
  external: ["react"],
}
export default defineConfig([
  {
    entry: ["./src/shared/index.ts"],
    ...commonConfig,
    format: ["cjs", "esm", "iife"],
    outDir: "dist/shared",
  },
  {
    entry: ["./src/server/index.ts"],
    ...commonConfig,
    format: ["cjs"],
    outDir: "dist/server",
  },
  {
    entry: ["./src/client/index.tsx"],
    ...commonConfig,
    format: ["esm", "iife"],
    outDir: "dist/client",
    banner: {
      js: '"use client"',
    },
  },
])
