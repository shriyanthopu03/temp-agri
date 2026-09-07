import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY ?? ''),
    },
    root: 'frontend',
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
    },
  }
})
