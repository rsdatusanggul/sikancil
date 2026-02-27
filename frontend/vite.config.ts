import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces (for Nginx)
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '192.168.11.30',
      'sikancil-dev.rsdatusanggul.com'
    ],
    // Proxy removed - Nginx will handle backend routing
  },
})
