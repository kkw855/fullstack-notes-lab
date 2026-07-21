import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  // server.proxy 설정은 로컬 개발 서버(npm run dev)를 돌릴 때만 작동하는 설정입니다.
  server: {
    proxy: {
      // 코드에서 /api로 시작하는 요청을 만나면
      '/api': {
        // 실제 백엔드 서버 주소로 주소를 바꿉니다 (스칼라 서버 등)
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
})

export default config
