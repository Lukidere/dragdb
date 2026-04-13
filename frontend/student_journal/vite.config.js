import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Wyłapywanie wszystkich zapytań zaczynających się /api
      '/api': {
        // Docelowy adres API
        target: 'http://localhost:8000',
        
        // Zmiana 'Origin' nagłówka hosta na docelowy URL
        changeOrigin: true,
        
        // Ścieżki to np. '/login', nie '/api/login' więc z zapytań ucinane jest '/api' z zapytań
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})