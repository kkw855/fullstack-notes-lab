import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { notesDb } from '#/testing/mocks/db'
import { server } from '#/testing/mocks/server'
import { renderApp } from '#/testing/render-app'

describe('/ (notes list)', () => {
  it('renders notes fetched from the API', async () => {
    notesDb.reset([
      { title: 'First note', content: 'First note content' },
      { title: 'Second note', content: 'Second note content' },
    ])

    renderApp()

    expect(await screen.findByText('First note')).toBeInTheDocument()
    expect(screen.getByText('Second note')).toBeInTheDocument()
  })

  it('shows the empty state when there are no notes', async () => {
    renderApp()

    expect(await screen.findByText('No notes yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /create your first note/i }),
    ).toBeInTheDocument()
  })

  it('shows the rate-limited UI when the API returns 429', async () => {
    server.use(
      http.get('/api/notes', () =>
        HttpResponse.json({ message: 'Too Many Requests' }, { status: 429 }),
      ),
    )

    renderApp()

    expect(await screen.findByText('Rate Limit Reached')).toBeInTheDocument()
  })

  it('deletes a note from the list', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    notesDb.reset([{ title: 'Note to delete', content: 'Bye' }])

    renderApp()

    const card = await screen.findByRole('link', { name: /note to delete/i })
    await user.click(within(card).getByRole('button'))

    await waitFor(() =>
      expect(screen.queryByText('Note to delete')).not.toBeInTheDocument(),
    )
    expect(notesDb.list()).toHaveLength(0)
  })

  it('keeps the note when the delete confirmation is dismissed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    notesDb.reset([{ title: 'Note to keep', content: 'Stay' }])

    renderApp()

    const card = await screen.findByRole('link', { name: /note to keep/i })
    await user.click(within(card).getByRole('button'))

    expect(screen.getByText('Note to keep')).toBeInTheDocument()
    expect(notesDb.list()).toHaveLength(1)
  })
})
