import { createFileRoute } from '@tanstack/react-router'

// 1. createFileRoute 뒤에 달러($) 기호가 포함된 주소를 명시합니다.
export const Route = createFileRoute('/note/$id')({
  component: NoteDetail,
})

function NoteDetail() {
  // 2. 중요! URL에 들어온 id 값을 꺼내 쓸 때는 Route.useParams()를 사용합니다.
  // 타입스크립트가 id가 string이라는 것을 완벽하게 추론해 줍니다.
  const { id } = Route.useParams()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">노트 상세 페이지</h1>
      <p className="mt-4 text-gray-600">
        현재 조회 중인 노트 ID: <strong className="text-blue-600">{id}</strong>
      </p>
    </main>
  )
}
