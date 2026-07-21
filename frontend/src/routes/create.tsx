import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { useCreateNote } from '#/features/notes/api/create-note'
import { NoteForm } from '#/features/notes/components/note-form'

export const Route = createFileRoute('/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const createNoteMutation = useCreateNote({
    mutationConfig: {
      onSuccess: async () => {
        toast.success('Note created successfully!')
        await navigate({ to: '/' })
      },
      onError: (error) => {
        // TODO: 429 응답 받았을 때 toast 띄우기
        console.log('Error creating note', error)
        toast.error('Failed to create note')
      },
    },
  })

  return (
    <NoteForm
      defaultValues={{ title: '', content: '' }}
      submit={createNoteMutation.mutate}
    />
  )
}
