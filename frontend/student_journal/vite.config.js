import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Wyłapywanie wszystkich zapytań zaczynających się /api
      '/api': {
        // Docelowy adres API(Na ten moment mockowy, gdy będzie łączność z backendem należy podmienić na http://localhost:8000)
        target: 'https://virtserver.swaggerhub.com/mmichalpawlikorganiz/student_journal/1.0.0',
        
        // Zmiana 'Origin' nagłówka hosta na docelowy URL (często wymagane przez serwery zewnętrzne)
        changeOrigin: true,
        
        // Ścieżki to np. '/login', nie '/api/login' więc z zapytań ucinane jest '/api' z zapytań
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})