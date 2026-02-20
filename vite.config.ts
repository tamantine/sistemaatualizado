import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunk para React e bibliotecas relacionadas
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Chunk para UI e icons
          'ui-vendor': ['lucide-react'],
          // Chunk para gráficos
          'charts-vendor': ['recharts'],
          // Chunk para Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          // Chunk para Zustand
          'store-vendor': ['zustand'],
        },
      },
    },
    // Configurações de otimização
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
})
