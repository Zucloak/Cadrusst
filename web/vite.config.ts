import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    exclude: ['rustycad']
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../pkg'),
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    fs: {
      // Allow serving files from the parent directory (pkg)
      allow: ['..']
    }
  }
})
