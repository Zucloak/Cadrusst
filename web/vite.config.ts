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
    // Exclude the WASM package from optimization to avoid issues
    exclude: ['rustycad']
  },
  resolve: {
    alias: {
      // Alias @core to the new location in src/wasm
      '@core': path.resolve(__dirname, './src/wasm'),
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    fs: {
      // Allow serving files from the parent directory if needed (mostly safe to keep)
      allow: ['..']
    }
  }
})
