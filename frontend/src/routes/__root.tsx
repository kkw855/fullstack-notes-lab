import libraryCss from '@endsoul/react-ui/style.css?url'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Check } from 'lucide-react'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

import { Navbar } from '#/components/navbar'
import { Toaster } from '#/components/ui/sonner'

import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Notes Lab',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: libraryCss,
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  // noinspection HtmlRequiredTitleElement
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          storageKey="notes-theme"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen">
            <Navbar />
            {children}
          </div>
          <Toaster
            position="top-center"
            icons={{
              success: (
                <div className="flex shrink-0 items-center justify-center rounded-full bg-[#00FF9D]">
                  <Check className="size-5 stroke-3 text-white" />
                </div>
              ),
            }}
          />
        </ThemeProvider>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />

        <Scripts />
      </body>
    </html>
  )
}
