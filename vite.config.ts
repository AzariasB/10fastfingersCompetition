import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import manifest from './src/manifest'

const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

const makeManifestPlugin = {
  name: 'make-manifest',
  buildEnd(err) {
    if (err) {
      return
    }
    if (!existsSync(outDir)) {
      mkdirSync(outDir)
    }

    const manifestPath = resolve(outDir, 'manifest.json')

    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

    console.log(`\nManifest file copy complete: ${manifestPath}`, 'success')
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), makeManifestPlugin],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === 'true',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(root, 'background', 'index.ts'),
        options: resolve(root, 'options', 'index.html'),
      },
      output: {
        entryFileNames: (chunk) => `src/${chunk.name}/index.js`,
      },
    },
  },
})
