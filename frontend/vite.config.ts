import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  server: {
    proxy: {
      // 1. 코드에서 /api로 시작하는 요청을 만나면
      '/api': {
        // 2. 실제 백엔드 서버 주소로 주소를 바꿉니다 (스칼라 서버 등)
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})

export default config
