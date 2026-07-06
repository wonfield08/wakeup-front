import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_EYE_STATUS_API_URL || 'http://127.0.0.1:8123'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/eye-status': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/eye-status/, '/v1/eye-status'),
        },
        '/api/eye-health': {
          target: apiUrl,
          changeOrigin: true,
          rewrite: () => '/health',
        },
      },
    },
  }
})
