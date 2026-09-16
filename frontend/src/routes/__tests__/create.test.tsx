import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { notesDb } from '#/testing/mocks/db'
import { renderApp } from '#/testing/render-app'

describe('/create', () => {
  it('노트를 생성하고 목록 화면으로 돌아간다', async () => {
    const user = userEvent.setup()
    renderApp({ initialLocation: '/create' })

    await screen.findByRole('heading', { name: 'Create New Note' })

    await user.type(screen.getByLabelText('Title'), 'Integration Test Note')
    await user.type(
      screen.getByLabelText('Content'),
      'Created through an integration test',
    )
    await user.click(screen.getByRole('button', { name: 'Create Note' }))

    expect(await screen.findByText('Integration Test Note')).toBeInTheDocument()
    expect(notesDb.list()).toMatchObject([{ title: 'Integration Test Note' }])
  })

  it('필수 입력값이 비어 있으면 제출하지 않고 화면도 이동하지 않는다', async () => {
    const user = userEvent.setup()
    renderApp({ initialLocation: '/create' })

    await screen.findByRole('heading', { name: 'Create New Note' })
    await user.click(screen.getByRole('button', { name: 'Create Note' }))

    await waitFor(() =>
      expect(screen.getAllByText('Required').length).toBeGreaterThan(0),
    )
    expect(
      screen.getByRole('heading', { name: 'Create New Note' }),
    ).toBeInTheDocument()
    expect(notesDb.list()).toHaveLength(0)
  })
})
