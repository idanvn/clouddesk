import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow external connections
    port: 5173,
    // If you need HTTPS for Google OAuth from remote:
    // https: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    // Disable source maps in production for security
    sourcemap: false,
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
