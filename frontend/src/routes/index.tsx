import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { RateLimitedUI } from '#/components/rate-limited-ui'
import { getNotesQueryOptions, useNotes } from '#/features/notes/api/get-notes'
import { NoteCard } from '#/features/notes/components/note-card'
import { NotesNotFound } from '#/features/notes/components/notes-not-found'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getNotesQueryOptions()),
  component: App,
})

function App() {
  const notesQuery = useNotes()

  // 1. 💡 [파생 상태] useState를 지우고, 쿼리 상태를 기반으로 즉시 변수를 도출합니다. (무한루프 원천 차단)
  const isRateLimited =
    notesQuery.isError &&
    axios.isAxiosError(notesQuery.error) &&
    notesQuery.error.response?.status === 429

  // 2. 💡 [진짜 에러 판별] 304(캐시)와 429(레이트 리밋)를 제외한 진짜 실패일 때만 에러로 간주합니다.
  const isActualError =
    notesQuery.isError &&
    (!axios.isAxiosError(notesQuery.error) ||
      (notesQuery.error.response?.status !== 304 &&
        notesQuery.error.response?.status !== 429))

  // 3. 💡 토스트 알림처럼 화면 렌더링 외적인 작업(Side Effect)은 useEffect 안에서 안전하게 실행합니다.
  useEffect(() => {
    if (isActualError) {
      toast.error('Failed to load notes')
    }
  }, [isActualError])

  const notes = notesQuery.data

  // 4. 💡 TanStack Query의 로딩 상태를 먼저 방어해 주는 것이 안전합니다.
  if (notesQuery.isLoading)
    return (
      <main className="mx-auto mt-6 max-w-7xl p-4">
        <div className="py-10 text-center">Loading notes...</div>
      </main>
    )

  // 429 레이트 리밋에 걸렸다면 차단 UI를 보여줍니다.
  if (isRateLimited)
    return (
      <main>
        <RateLimitedUI />
      </main>
    )

  // 데이터가 없다면 화면을 그리지 않습니다.
  if (!notes) return null

  // 5. 모든 방어망을 통과한 정상적인 화면 렌더링
  return (
    <main className="mx-auto mt-6 max-w-7xl p-4">
      {notes.length === 0 ? (
        <NotesNotFound />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </main>
  )
}
