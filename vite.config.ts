import { defineConfig } from 'vite'
import { builtinModules } from 'node:module'

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
      input: './src/preload.ts',
      output: {
        format: 'cjs',
        entryFileNames: '[name].js'
      }
    }
  }
})
