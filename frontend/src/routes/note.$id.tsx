import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { getNoteQueryOptions } from '#/features/notes/api/get-note'
import { useUpdateNote } from '#/features/notes/api/update-note'
import { NoteForm, NoteFormLayout } from '#/features/notes/components/note-form'

function NoteDetailSkeleton() {
  return (
    <NoteFormLayout>
      <div role="status">
        <span className="sr-only">노트를 불러오는 중...</span>
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          <div className="mb-8 flex justify-between">
            <div className="h-10 w-36 rounded-3xl bg-white/10" />{' '}
            {/* Back to Notes */}
            <div className="h-9 w-32 rounded-md bg-white/10" />{' '}
            {/* Delete Note */}
          </div>
          <div className="space-y-6 bg-[#181111] p-8">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-10 rounded bg-white/10" />{' '}
              {/* Title 라벨 */}
              <div className="h-9 rounded-2xl bg-white/10" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-16 rounded bg-white/10" />{' '}
              {/* Content 라벨 */}
              <div className="h-40 rounded-2xl bg-white/10" />
            </div>
            <div className="flex justify-end">
              <div className="h-9 w-32 rounded-xl bg-white/10" />{' '}
              {/* Save Changes */}
            </div>
          </div>
        </div>
      </div>
    </NoteFormLayout>
  )
}

// 1. createFileRoute 뒤에 달러($) 기호가 포함된 주소를 명시합니다.
export const Route = createFileRoute('/note/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(getNoteQueryOptions(params.id)),
  pendingComponent: NoteDetailSkeleton,
  pendingMs: 200,
  component: NoteDetail,
})

function NoteDetail() {
  // 2. 중요! URL에 들어온 id 값을 꺼내 쓸 때는 Route.useParams()를 사용합니다.
  // 타입스크립트가 id가 string이라는 것을 완벽하게 추론해 줍니다.
  const { id } = Route.useParams()

  const navigate = useNavigate()

  const noteMutation = useUpdateNote({
    mutationConfig: {
      onSuccess: async () => {
        toast.success('Note updated successfully')
        await navigate({ to: '/' })
      },
    },
  })

  const note = useSuspenseQuery(getNoteQueryOptions(id)).data

  return (
    <NoteForm
      defaultValues={{
        title: note.title,
        content: note.content,
      }}
      submit={({ data }) => {
        noteMutation.mutate({ noteId: id, data })
      }}
      noteId={id}
    />
  )
}
