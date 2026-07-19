import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main>
      <button onClick={() => toast('노트가 성공적으로 저장되었습니다!')}>
        저장하기
      </button>
    </main>
  )
}
