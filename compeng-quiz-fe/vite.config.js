import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ============================================================
// Vite Configuration — QuizLive CompEng
// ============================================================
// - Alias '@' → src/ untuk import yang clean
// - Server di-expose ke 0.0.0.0 supaya bisa diakses LAN
// - Proxy opsional kalau mau menghindari CORS saat dev
// ============================================================

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Aktifkan proxy ini jika butuh menghindari CORS sepenuhnya
    // proxy: {
    //   '/api': {
    //     target: 'http://192.168.101.232:3000',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   '/socket.io': {
    //     target: 'http://192.168.101.232:3000',
    //     ws: true,
    //     changeOrigin: true,
    //   },
    // },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion-vendor': ['framer-motion'],
          'socket-vendor': ['socket.io-client'],
        },
      },
    },
  },
})
