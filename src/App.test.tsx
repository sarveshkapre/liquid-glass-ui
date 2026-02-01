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
})
