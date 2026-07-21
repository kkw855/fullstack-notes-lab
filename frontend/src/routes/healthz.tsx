import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/healthz')({
  // 🌟 loader나 API 호출을 절대 넣지 않습니다!
  component: () => <div>OK</div>,
})
