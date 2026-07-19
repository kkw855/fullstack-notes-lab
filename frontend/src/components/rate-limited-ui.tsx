import { ZapIcon } from 'lucide-react'

export const RateLimitedUI = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-lg border border-primary/30 bg-[#000F02] shadow-md">
        <div className="flex flex-col items-center p-6 md:flex-row">
          <div className="mb-4 shrink-0 rounded-full bg-[#003714] p-4 md:mr-6 md:mb-0">
            <ZapIcon className="size-10 text-[#31A964]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="mb-2 text-xl font-bold">Rate Limit Reached</h3>
            <p className="mb-1 bg-[#000F02]">
              You&#39;ve made too many requests in a short period. Please wait a
              moment.
            </p>
            <p className="text-sm text-[#596458]">
              Try again in a few seconds for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
