import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { PenSquareIcon, Trash2Icon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { Note } from '#/types/api'

export const NoteCard = ({ note }: { note: Note }) => {
  const dateFormat = 'YYYY-MM-DD HH:mm'

  return (
    <Link
      to="/note/$id"
      params={{ id: note.id }}
      className="block w-100 rounded-2xl border-t-4 border-solid border-[#00FF9D] bg-[#181111] p-6  transition-all duration-200 hover:shadow-lg"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">{note.title}</h3>
        <p className="line-clamp-3 text-white/60">{note.content}</p>
        <div className="mt-6 flex items-center justify-between text-white/60!">
          <span className="text-sm">
            {dayjs(note.createdAt).format(dateFormat)}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" />
            <Button
              variant="ghost"
              className="text-red-500"
              onClick={(e) => {
                e.preventDefault()
                console.log('trash')
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
