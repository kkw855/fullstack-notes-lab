import { Button } from '@endsoul/react-ui'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { PenSquareIcon, Trash2Icon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import { useDeleteNote } from '#/features/notes/api/delete-note'
import type { Note } from '#/types/api'

export const NoteCard = ({ note }: { note: Note }) => {
  const deleteNoteMutation = useDeleteNote({
    mutationConfig: {
      onSuccess: () => {
        toast.success('Note deleted successfully')
      },
      onError: (error) => {
        console.log('Error in handleDelete', error)
        toast.error('Failed to delete note')
      },
    },
  })

  const dateFormat = 'YYYY-MM-DD HH:mm'

  return (
    <Link
      preload={false}
      to="/note/$id"
      params={{ id: note.id }}
      className="block w-full rounded-2xl border-t-4 border-solid border-[#00FF9D] bg-[#181111] p-6  transition-all duration-200 hover:shadow-lg"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">{note.title}</h3>
        {/* max-h-96(24rem) 기준: 마스크는 max-h - 4rem 부터 max-h 까지 페이드. max-h 바꾸면 20rem/24rem 도 같이 변경 */}
        <div className="prose prose-sm max-h-96 max-w-none overflow-hidden mask-[linear-gradient(to_bottom,black_20rem,transparent_24rem)] prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              a: ({ children }) => (
                <span className="underline">{children}</span>
              ),
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>
        <div className="mt-6 flex items-center justify-between text-white/60!">
          <span className="text-sm">
            {dayjs(note.updatedAt).format(dateFormat)}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" />
            <Button
              variant="ghost"
              className="cursor-pointer text-red-500"
              onClick={(e) => {
                e.preventDefault()

                if (
                  window.confirm('Are you sure you want to delete this note?')
                )
                  deleteNoteMutation.mutate({ noteId: note.id })
              }}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
