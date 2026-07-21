import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { getNoteQueryOptions, useNote } from '#/features/notes/api/get-note'
import { useUpdateNote } from '#/features/notes/api/update-note'
import { NoteForm } from '#/features/notes/components/note-form'

// 1. createFileRoute 뒤에 달러($) 기호가 포함된 주소를 명시합니다.
export const Route = createFileRoute('/note/$id')({
  loader: ({ context, params }) =>
    context.queryClient.prefetchQuery(getNoteQueryOptions(params.id)),
  component: NoteDetail,
})

function NoteDetail() {
  // 2. 중요! URL에 들어온 id 값을 꺼내 쓸 때는 Route.useParams()를 사용합니다.
  // 타입스크립트가 id가 string이라는 것을 완벽하게 추론해 줍니다.
  const { id } = Route.useParams()

  const navigate = useNavigate()

  const noteMutation = useUpdateNote({
    noteId: id,
    mutationConfig: {
      onSuccess: async () => {
        toast.success('Note updated successfully')
        await navigate({ to: '/' })
      },
    },
  })

  const noteQuery = useNote({ noteId: id })

  if (!noteQuery.data) return null

  const note = noteQuery.data

  return (
    <NoteForm
      defaultValues={{
        title: note.title,
        content: note.content,
      }}
      submit={(data) => {
        noteMutation.mutate({ noteId: id, ...data })
      }}
      noteId={id}
    />
  )
}
