import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // Override Vite plugins — don't load vite-plugin-electron-renderer in tests
  plugins: [],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
