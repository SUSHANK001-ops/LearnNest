import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  // Proxy any /api requests to the backend running on localhost:3000 during dev
  server: {
    proxy: {
      '/api': {
        // backend default PORT is 4000 (see server/.env)
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
