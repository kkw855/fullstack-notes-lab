import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  createNoteInputSchema,
  useCreateNote,
} from '#/features/notes/api/create-note'

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

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
    },
    resolver: zodResolver(createNoteInputSchema),
  })

  const submit = handleSubmit((data) => {
    createNoteMutation.mutate({ data })
  })

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/"
            className="mb-8 inline-flex h-10 items-center justify-center gap-2 rounded-3xl px-4 py-2 text-sm font-bold text-white! transition-colors hover:bg-black/50"
          >
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          <div className="bg-[#181111] p-8">
            <div className="">
              <h2 className="mb-4 text-2xl font-bold">Create New Note</h2>
              <form onSubmit={submit} className="space-y-6">
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
                  {errors.content && (
                    <span className="text-xs text-red-500">
                      {errors.content.message}
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
                    className="cursor-pointer rounded-xl bg-[#20B658] font-bold hover:bg-[#20B658]/70"
                    disabled={isSubmitting}
                  >
                    Create Note
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
