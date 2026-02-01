import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the hero heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: /design tokens \+ glass components inspired by apple\./i,
      }),
    ).toBeInTheDocument()
  })

  it('toggles the theme', async () => {
    render(<App />)

    const [toggle] = screen.getAllByLabelText(/switch to .* theme/i)
    const initialTheme = document.documentElement.dataset.theme

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).not.toBe(initialTheme)
    })
  })

  it('copies a token value to the clipboard', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

    render(<App />)

    await user.click(screen.getByRole('button', { name: /copy value for glass\.blur\.24/i }))

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('blur(24px)')
    })

    expect(await screen.findByText(/copied glass\.blur\.24 value/i)).toBeInTheDocument()
  })

  it('exposes token download links', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /download json/i })).toHaveAttribute(
      'href',
      '/tokens.json',
    )
    expect(screen.getByRole('link', { name: /download css/i })).toHaveAttribute(
      'href',
      '/tokens.css',
    )
  })

  it('has a skip link to main content', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
      'href',
      '#main',
    )
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('copies a component snippet to the clipboard', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

    render(<App />)

    await user.click(screen.getAllByText('Usage')[0])
    await user.click(screen.getByRole('button', { name: /copy snippet for float card/i }))

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('class="glass-card"'))
    })
  })

  it('focuses the demo search input with / or Ctrl+K', () => {
    render(<App />)

    const input = screen.getByPlaceholderText('Search styles')

    fireEvent.keyDown(window, { key: '/', code: 'Slash' })
    expect(input).toHaveFocus()

    input.blur()

    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', ctrlKey: true })
    expect(input).toHaveFocus()
  })
})
