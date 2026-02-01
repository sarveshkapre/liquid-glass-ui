import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
})
