import '@testing-library/jest-dom/vitest'

import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { notesDb } from '#/testing/mocks/db'
import { server } from '#/testing/mocks/server'

// jsdom은 scrollRestoration이 쓰는 scrollTo를 구현하지 않아 "Not implemented" 경고를 뱉는다.
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn()
}

// jsdom에는 matchMedia가 구현되어 있지 않아 next-themes/radix 등에서 참조 시 터진다.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  notesDb.reset()
})

afterAll(() => server.close())
