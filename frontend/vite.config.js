import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
            if (!id.includes('node_modules')) return

            if (id.includes('react-dom') || id.includes('react')) return 'react-vendor'
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts'
            if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons'
          },
        },
      },
    },
  }
})
