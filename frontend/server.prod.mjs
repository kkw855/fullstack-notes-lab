// 프로덕션 Node 서버 엔트리
//
// `vite build`가 만드는 dist/server/server.js 는 listening 서버가 아니라
// `export default { fetch }` 형태의 fetch 핸들러입니다.
// (개발/프리뷰 시에는 Vite가 이 핸들러를 감싸서 서빙해 줍니다.)
//
// 프로덕션에서는 Vite 없이 떠야 하므로, TanStack Start가 내부적으로 쓰는
// srvx 어댑터로 직접 감싸 줍니다.
//   1. dist/client 의 정적 자산을 먼저 서빙
//   2. 매칭되는 파일이 없으면 SSR fetch 핸들러로 폴백
import { serve } from 'srvx'
import { serveStatic } from 'srvx/static'

import handler from './dist/server/server.js'

const port = Number(process.env.PORT ?? 3000)
const hostname = process.env.HOST ?? '0.0.0.0'

const server = serve({
  port,
  hostname,
  middleware: [
    serveStatic({
      dir: './dist/client',
      // 🌟 static 파일(CSS, JS, 이미지 등)을 1년간 브라우저에 캐싱하도록 설정
      maxAge: 31536000,
    }),
  ],
  fetch: handler.fetch,
})

await server.ready()
console.log(`Server started on PORT: ${port}`)

// 쿠버네티스가 보내는 종료 신호에 맞춰 graceful shutdown
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close().then(() => process.exit(0))
  })
}
