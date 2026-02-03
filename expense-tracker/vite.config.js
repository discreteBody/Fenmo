import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward requests from the dev server to the Spring Boot backend
      '/expenses': {
        target: 'https://fenmo-1.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
