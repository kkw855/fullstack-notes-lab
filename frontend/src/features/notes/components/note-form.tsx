import {
  Button,
  Input,
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from '@endsoul/react-ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import {
  type CreateNoteInput,
  createNoteInputSchema,
} from '#/features/notes/api/create-note'
import { useDeleteNote } from '#/features/notes/api/delete-note'
import { AutoResizeTextArea } from '#/features/notes/components/auto-resize-text-area'

type Props = {
  defaultValues: CreateNoteInput
  submit: ({ data }: { data: CreateNoteInput }) => void
  noteId?: string
}

export const NoteFormLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen text-foreground">
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  </div>
)

export const NoteForm = ({ defaultValues, submit, noteId }: Props) => {
  const navigate = useNavigate()

  const [tab, setTab] = useState<'write' | 'preview'>(
    noteId ? 'preview' : 'write',
  )

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
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: zodResolver(createNoteInputSchema),
  })

  const onSubmit = handleSubmit((data) => {
    submit({ data })
  })

  return (
    <NoteFormLayout>
      <div className="flex justify-between">
        <Link
          to="/"
          className="mb-8 inline-flex h-10 items-center justify-center gap-2 rounded-3xl px-4 py-2 text-sm font-bold transition-colors hover:bg-black/50"
        >
          <ArrowLeftIcon className="size-5" />
          Back to Notes
        </Link>
        {noteId && (
          <Button
            className="cursor-pointer border-red-400! text-red-400 hover:bg-red-400! hover:text-white"
            onClick={() => {
              if (
                window.confirm('Are you sure you want to delete this note?')
              ) {
                deleteMutation.mutate({ noteId })
              }
            }}
          >
            <Trash2Icon className="size-4" /> Delete Note
          </Button>
        )}
      </div>

      <div className="bg-muted p-8">
        <div>
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
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList>
                  <TabsTab value="write">Write</TabsTab>
                  <TabsTab value="preview">Preview</TabsTab>
                  <TabsIndicator className="bg-muted" />
                </TabsList>
                <div className="w-full border border-border">
                  <TabsPanel value="write" className="p-0">
                    <AutoResizeTextArea
                      id="content"
                      className="w-full rounded-2xl p-4"
                      placeholder="Write your note here..."
                      registration={register('content')}
                    />
                  </TabsPanel>
                  <TabsPanel value="preview" className="p-0">
                    <div className="prose prose-sm max-w-none p-4 dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          a: ({ children }) => (
                            <span className="underline">{children}</span>
                          ),
                        }}
                      >
                        {getValues('content')}
                      </ReactMarkdown>
                    </div>
                  </TabsPanel>
                </div>
              </Tabs>
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
    </NoteFormLayout>
  )
}
