import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { notesDb } from '#/testing/mocks/db'
import { renderApp } from '#/testing/render-app'

describe('/note/$id', () => {
  it('pre-fills the form with the existing note and saves changes', async () => {
    notesDb.reset([{ title: 'Original Title', content: 'Original content' }])
    const [note] = notesDb.list()
    const user = userEvent.setup()

    renderApp({ initialLocation: `/note/${note.id}` })

    const titleInput = await screen.findByLabelText<HTMLInputElement>('Title')
    await waitFor(() => expect(titleInput).toHaveValue('Original Title'))
    expect(screen.getByLabelText('Content')).toHaveValue('Original content')

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Updated Title')).toBeInTheDocument()
    expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    expect(notesDb.find(note.id)).toMatchObject({ title: 'Updated Title' })
  })

  it('deletes the note and redirects back to the notes list', async () => {
    notesDb.reset([{ title: 'Doomed Note', content: 'Will be deleted' }])
    const [note] = notesDb.list()
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderApp({ initialLocation: `/note/${note.id}` })

    await screen.findByDisplayValue('Doomed Note')
    await user.click(screen.getByRole('button', { name: /delete note/i }))

    await waitFor(() => expect(notesDb.list()).toHaveLength(0))
    expect(await screen.findByText('No notes yet')).toBeInTheDocument()
  })
})
