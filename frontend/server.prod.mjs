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
const SHUTDOWN_TIMEOUT_MS = Number(process.env.SHUTDOWN_TIMEOUT_MS ?? 10000)
const DRAIN_DELAY_MS = Number(process.env.DRAIN_DELAY_MS ?? 3000)

let isShuttingDown = false

// 헬스체크 및 graceful shutdown 상태를 관리하는 fetch 핸들러 래퍼
const fetchWithHealthCheck = async (req, ctx) => {
  const url = new URL(req.url)

  // 쿠버네티스 Liveness/Readiness Probe 경로 (/healthz, /readyz, /health)
  if (['/healthz', '/readyz', '/health'].includes(url.pathname)) {
    if (isShuttingDown) {
      return new Response(
        JSON.stringify({
          status: 'shutting_down',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', Connection: 'close' },
        },
      )
    }
    return new Response(
      JSON.stringify({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // 셧다운 진행 중이면 새 요청 응답에 Connection: close 헤더 추가
  if (isShuttingDown) {
    const response = await handler.fetch(req, ctx)
    const headers = new Headers(response.headers)
    headers.set('Connection', 'close')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  return handler.fetch(req, ctx)
}

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
  fetch: fetchWithHealthCheck,
})

await server.ready()
console.log(`Server started on PORT: ${port} (PID: ${process.pid})`)

// Graceful Shutdown 강화 로직
let shutdownInProgress = false

async function gracefulShutdown(signal) {
  if (shutdownInProgress) return
  shutdownInProgress = true
  isShuttingDown = true

  console.log(
    `\n[Graceful Shutdown] ${signal} signal received. Initiating graceful shutdown...`,
  )
  console.log(
    `[Graceful Shutdown] Marked server as unready (503 for health checks).`,
  )

  // 1️⃣ 쿠버네티스 Ingress/Kube-proxy 엔드포인트 갱신을 위한 드레인 대기 (Default 3초)
  if (DRAIN_DELAY_MS > 0) {
    console.log(
      `[Graceful Shutdown] Waiting ${DRAIN_DELAY_MS}ms for active connections to drain and ingress route updates...`,
    )
    await new Promise((resolve) => setTimeout(resolve, DRAIN_DELAY_MS))
  }

  // 2️⃣ 강제 종료 타임아웃 타이머 설정 (Default 10초)
  const timer = setTimeout(() => {
    console.error(
      `[Graceful Shutdown] Forcefully terminating process after ${SHUTDOWN_TIMEOUT_MS}ms timeout.`,
    )
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)

  if (timer.unref) {
    timer.unref()
  }

  // 3️⃣ 서버 연결 차단 및 안전한 종료
  try {
    console.log(`[Graceful Shutdown] Closing HTTP server...`)
    await server.close()
    console.log(
      `[Graceful Shutdown] HTTP server closed successfully. Clean exit.`,
    )
    clearTimeout(timer)
    process.exit(0)
  } catch (err) {
    console.error(`[Graceful Shutdown] Error during server close:`, err)
    clearTimeout(timer)
    process.exit(1)
  }
}

// 쿠버네티스가 보내는 종료 신호에 맞춰 graceful shutdown
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    gracefulShutdown(signal)
  })
}

// 미처 캡처되지 않은 프로세스 예외 발생 시 안전하게 셧다운 진행
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown('unhandledRejection')
})
