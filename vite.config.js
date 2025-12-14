import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
    server: {
        host: '0.0.0.0',  // 监听所有网络接口
        port: 5173,
        allowedHosts: [
            'frp-can.com',
            'localhost',
            '127.0.0.1'
        ],
        // 添加代理配置，将 /api 开头的请求代理到后端服务
        proxy: {
            '/api': {
                target: 'http://localhost:8080', // 后端服务地址
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})
