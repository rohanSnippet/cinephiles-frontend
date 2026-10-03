import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
    esbuild: {
    supported: {
      'top-level-await': true,
    },
    target: 'esnext',
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@mui/material', 
      '@mui/joy', 
      'framer-motion', 
      'sweetalert2', 
      'axios',
      '@tanstack/react-query'
    ]
  }
})
