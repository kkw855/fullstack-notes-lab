import { RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { createTestRouter } from '#/testing/create-test-router'

export function renderApp({
  initialLocation = '/',
}: { initialLocation?: string } = {}) {
  const { router, queryClient } = createTestRouter({ initialLocation })

  const utils = render(<RouterProvider router={router} />)

  return { ...utils, router, queryClient }
}
