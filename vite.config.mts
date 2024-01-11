import { resolve } from "node:path";
import { defineConfig } from "vite";
import makeManifest from "./utils/plugins/makeManifest";
import { outputFolderName } from "./utils/constants";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, outputFolderName);
const publicDir = resolve(__dirname, "public");

export default defineConfig({
  plugins: [makeManifest()],
  publicDir,
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === "true",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(root, "background", "index.ts"),
        options: resolve(root, "options", "index.html"),
      },
      output: {
        entryFileNames: (chunk) => `src/${chunk.name}/index.js`,
      },
    },
  },
});
