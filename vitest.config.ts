/// <reference types="vitest" />
/// <reference types="@types/chrome" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
})
