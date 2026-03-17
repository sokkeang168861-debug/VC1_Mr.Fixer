import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getVendorChunkName(id) {
  if (!id.includes('node_modules')) return undefined

  if (id.includes('react-dom') || id.includes('/react/')) return 'react-core'
  if (id.includes('react-router')) return 'router'
  if (id.includes('@react-google-maps')) return 'maps'
  if (id.includes('motion')) return 'motion'
  if (id.includes('axios')) return 'http'
  if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts'
  if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons'

  return 'vendor'
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const devBackendUrl = env.VITE_DEV_BACKEND_URL || 'http://localhost:5000'

  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: env.VITE_DEV_HOST || '0.0.0.0',
      port: Number(env.VITE_DEV_PORT || 5173),
      strictPort: true,
      proxy: {
        '/api': {
          target: devBackendUrl,
          changeOrigin: true,
        },
        '/uploads': {
          target: devBackendUrl,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: env.VITE_PREVIEW_HOST || '0.0.0.0',
      port: Number(env.VITE_PREVIEW_PORT || 4173),
      strictPort: true,
    },
    build: {
      sourcemap: env.VITE_BUILD_SOURCEMAP === 'true',
      rollupOptions: {
        output: {
          manualChunks(id) {
            return getVendorChunkName(id)
          },
        },
      },
    },
  }
})
