import { Link } from '@tanstack/react-router'
import { NotebookIcon } from 'lucide-react'

export const NotesNotFound = () => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-6 py-16 text-center">
      <div className="rounded-full bg-[#020E04] p-8">
        <NotebookIcon className="size-10 stroke-[#20B658] text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No notes yet</h3>
      <p className="text-[#5E5E5E]">
        Ready to organize your thoughts? Create your first note to get started
        on your journey.
      </p>
      <Link
        to="/create"
        className="mb-8 inline-flex h-10 items-center justify-center gap-2 rounded-3xl bg-[#20B658] px-4 py-2 text-sm font-bold text-white! transition-colors hover:bg-[#20B658]/50"
      >
        Create Your First Note
      </Link>
    </div>
  )
}
