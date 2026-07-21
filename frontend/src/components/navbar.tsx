import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

export const Navbar = () => {
  return (
    <header className="border-b bg-[#202020]">
      <div className="mx-auto max-w-6xl  p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-3xl font-bold tracking-tight text-[#20B658]">
            ThinkBoard
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/create"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-3xl bg-[#20B658] px-4 py-2 text-sm font-bold text-white! transition-colors hover:bg-[#20B658]/70"
            >
              <PlusIcon className="size-5" />
              <span>New Note</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
