import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { notesDb } from '#/testing/mocks/db'
import { renderApp } from '#/testing/render-app'

describe('/note/$id', () => {
  it('기존 노트 내용을 폼에 채우고 수정한 내용을 저장한다', async () => {
    notesDb.reset([{ title: 'Original Title', content: 'Original content' }])
    const [note] = notesDb.list()
    const user = userEvent.setup()

    renderApp({ initialLocation: `/note/${note.id}` })

    const titleInput = await screen.findByLabelText<HTMLInputElement>('Title')
    await waitFor(() => expect(titleInput).toHaveValue('Original Title'))

    await user.click(screen.getByRole('tab', { name: 'Write' }))
    expect(screen.getByLabelText('Content')).toHaveValue('Original content')

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Title')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Updated Title')).toBeInTheDocument()
    expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    expect(notesDb.find(note.id)).toMatchObject({ title: 'Updated Title' })
  })

  it('노트를 삭제하고 목록 화면으로 돌아간다', async () => {
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
