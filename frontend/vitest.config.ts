import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// 💡 vite.config.ts를 그대로 재사용하지 않는 이유:
// tanstackStart()/devtools() 플러그인은 빌드/SSR 전용이라 jsdom 환경에서
// Vitest가 설정을 로드할 때 불필요하게 충돌할 수 있어 테스트 전용 설정을 분리합니다.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000' },
    },
    globals: true,
    css: false,
    setupFiles: ['./src/testing/setup.ts'],
  },
})
