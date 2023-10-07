import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PluginOption } from "vite";
import manifest from "../../src/manifest";

const outDir = resolve(__dirname, "..", "..", "public");

export default function makeManifest(): PluginOption {
  return {
    name: "make-manifest",
    buildEnd() {
      if (!existsSync(outDir)) {
        mkdirSync(outDir);
      }

      const manifestPath = resolve(outDir, "manifest.json");

      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      console.log(`\nManifest file copy complete: ${manifestPath}`, "success");
    },
  };
}
