import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { notesDb } from '#/testing/mocks/db'
import { renderApp } from '#/testing/render-app'

describe('/create', () => {
  it('creates a note and redirects back to the notes list', async () => {
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

  it('does not submit or navigate away when required fields are empty', async () => {
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
