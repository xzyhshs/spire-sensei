import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  root: 'src',
  plugins: [
    react(),
    electron([
      {
        entry: '../electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', 'path', 'fs']
            }
          }
        }
      },
      { entry: '../electron/preload.ts', onstart(options) { options.reload() } }
    ]),
    renderer()
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  build: {
    outDir: '../dist'
  }
})
