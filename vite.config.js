import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },
  server: {
    port: 5173,
    strictPort: true,
    proxy:{
      '/api': {
        target: 'https://morago-api.habsida.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'https://morago-api.habsida.net',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
