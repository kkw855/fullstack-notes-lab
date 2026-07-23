import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  type CreateNoteInput,
  createNoteInputSchema,
} from '#/features/notes/api/create-note'
import { useDeleteNote } from '#/features/notes/api/delete-note'

type Props = {
  defaultValues: CreateNoteInput
  submit: ({ data }: { data: CreateNoteInput }) => void
  noteId?: string
}

export const NoteForm = ({ defaultValues, submit, noteId }: Props) => {
  const navigate = useNavigate()

  const deleteMutation = useDeleteNote({
    mutationConfig: {
      onSuccess: async () => {
        toast.success('Note deleted successfully')
        await navigate({ to: '/' })
      },
      onError: (error) => {
        console.log('Error deleting note', error)
        toast.error('Failed to delete note')
      },
    },
  })

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: zodResolver(createNoteInputSchema),
  })

  const onSubmit = handleSubmit((data) => {
    submit({ data })
  })

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-between">
            <Link
              to="/"
              className="mb-8 inline-flex h-10 items-center justify-center gap-2 rounded-3xl px-4 py-2 text-sm font-bold text-white! transition-colors hover:bg-black/50"
            >
              <ArrowLeftIcon className="size-5" />
              Back to Notes
            </Link>
            {noteId && (
              <Button
                variant="outline"
                className="cursor-pointer border-red-400! text-red-400 hover:bg-red-400! hover:text-white"
                onClick={() => {
                  if (
                    window.confirm('Are you sure you want to delete this note?')
                  ) {
                    deleteMutation.mutate({ noteId })
                  }
                }}
              >
                <Trash2Icon /> Delete Note
              </Button>
            )}
          </div>

          <div className="bg-[#181111] p-8">
            <div className="">
              {!noteId && (
                <h2 className="mb-4 text-2xl font-bold">Create New Note</h2>
              )}
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="title">
                    <span className="text-sm">Title</span>
                  </label>
                  <Input
                    id="title"
                    className="rounded-2xl"
                    placeholder="Note Title"
                    {...register('title')}
                  />
                  {errors.title && (
                    <span className="text-xs text-red-500">
                      {errors.title.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="content">
                    <span className="text-sm">Content</span>
                  </label>
                  <textarea
                    id="content"
                    className="rounded-2xl bg-[#1C1819] p-3"
                    rows={5}
                    placeholder="Write your note here..."
                    {...register('content')}
                  />
                  {errors.content && (
                    <span className="text-xs text-red-500">
                      {errors.content.message}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <Button
                    type="submit"
                    className="cursor-pointer rounded-xl bg-[#20B658] font-bold text-white hover:bg-[#20B658]/70"
                    disabled={isSubmitting}
                  >
                    {noteId ? 'Save Changes' : 'Create Note'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
