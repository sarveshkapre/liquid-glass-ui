import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('dark') || query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

const storage = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  },
})

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: async () => undefined,
  },
  configurable: true,
})

if (!('createObjectURL' in URL)) {
  Object.defineProperty(URL, 'createObjectURL', {
    value: () => 'blob:mock',
    configurable: true,
  })
}

if (!('revokeObjectURL' in URL)) {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: () => undefined,
    configurable: true,
  })
}

Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
  value: () => undefined,
  configurable: true,
})
