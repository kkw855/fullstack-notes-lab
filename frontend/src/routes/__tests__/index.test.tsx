import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { notesDb } from '#/testing/mocks/db'
import { server } from '#/testing/mocks/server'
import { renderApp } from '#/testing/render-app'

describe('/ (노트 목록)', () => {
  it('API에서 받아온 노트를 화면에 보여준다', async () => {
    notesDb.reset([
      { title: 'First note', content: 'First note content' },
      { title: 'Second note', content: 'Second note content' },
    ])

    renderApp()

    expect(await screen.findByText('First note')).toBeInTheDocument()
    expect(screen.getByText('Second note')).toBeInTheDocument()
  })

  it('노트가 없으면 빈 상태 화면을 보여준다', async () => {
    renderApp()

    expect(await screen.findByText('No notes yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /create your first note/i }),
    ).toBeInTheDocument()
  })

  it('API가 429를 반환하면 요청 제한 화면을 보여준다', async () => {
    server.use(
      http.get('/api/notes', () =>
        HttpResponse.json({ message: 'Too Many Requests' }, { status: 429 }),
      ),
    )

    renderApp()

    expect(await screen.findByText('Rate Limit Reached')).toBeInTheDocument()
  })

  it('목록에서 노트를 삭제한다', async () => {
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

  it('삭제 확인창에서 취소하면 노트를 그대로 둔다', async () => {
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
