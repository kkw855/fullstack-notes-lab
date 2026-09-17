import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { afterEach, describe, expect, it } from 'vitest'

import { ThemeToggle } from '#/components/theme-toggle'

const renderToggle = () =>
  render(
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="notes-theme"
    >
      <ThemeToggle />
    </ThemeProvider>,
  )

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.className = ''
})

describe('ThemeToggle', () => {
  it('클릭하면 시스템 -> 라이트 -> 다크 순으로 바뀐다', async () => {
    const user = userEvent.setup()
    renderToggle()

    const button = await screen.findByRole('button', { name: /시스템 설정/ })
    await user.click(button)
    expect(
      screen.getByRole('button', { name: /현재 라이트 모드/ }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(
      screen.getByRole('button', { name: /현재 다크 모드/ }),
    ).toBeInTheDocument()
  })

  it('선택한 테마를 localStorage에 저장한다', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(await screen.findByRole('button'))

    expect(window.localStorage.getItem('notes-theme')).toBe('light')
    expect(document.documentElement).toHaveClass('light')
  })
})
