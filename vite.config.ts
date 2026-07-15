import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Resolve react subpaths explicitly so bundlers (Vite 8 / rolldown) can find
// `react/jsx-runtime` imported by dependencies like framer-motion.
const reactJsxRuntime = require.resolve('react/jsx-runtime')
const reactJsxDevRuntime = require.resolve('react/jsx-dev-runtime')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react/jsx-runtime': reactJsxRuntime,
      'react/jsx-dev-runtime': reactJsxDevRuntime,
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            if (id.includes('framer-motion') || id.includes('motion-')) {
              return 'motion-vendor'
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor'
            }
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/functions/v1': {
        target: 'https://psncncqfresntvksmfko.supabase.co',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
