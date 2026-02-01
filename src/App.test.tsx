import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { within } from '@testing-library/react'
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

  it('toggles the motion mode', async () => {
    render(<App />)

    const toggle = screen.getByRole('button', { name: /switch to full motion|switch to reduced motion/i })
    const initialMotion = document.documentElement.dataset.motion

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(document.documentElement.dataset.motion).not.toBe(initialMotion)
    })
  })

  it('copies a token value to the clipboard', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Copy value for glass.blur.24' }),
    )

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('blur(24px)')
    })

    expect(await screen.findByText(/copied glass\.blur\.24 value/i)).toBeInTheDocument()
  })

  it('shows token usage chips', () => {
    render(<App />)

    expect(screen.getByLabelText(/used by for glass\.blur\.24/i)).toBeInTheDocument()
    expect(screen.getAllByText('Used by').length).toBeGreaterThan(0)
  })

  it('filters the token table by search query', async () => {
    const user = userEvent.setup()
    render(<App />)

    const search = screen.getByRole('searchbox', { name: /search tokens/i })
    await user.clear(search)
    await user.type(search, 'accent.coral')

    expect(screen.getByText('Showing 1 of 6')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: /token table/i })
    expect(within(table).getByText('accent.coral')).toBeInTheDocument()
    expect(within(table).queryByText('glass.blur.24')).not.toBeInTheDocument()
  })

  it('filters the token table by used-by', async () => {
    const user = userEvent.setup()
    render(<App />)

    const usedBy = screen.getByRole('combobox', { name: /filter tokens by usage/i })
    await user.selectOptions(usedBy, 'Focus ring')

    expect(screen.getByText('Showing 1 of 6')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: /token table/i })
    expect(within(table).getByText('accent.aqua')).toBeInTheDocument()
  })

  it('filters the token table by group', async () => {
    const user = userEvent.setup()
    render(<App />)

    const group = screen.getByRole('combobox', { name: /filter tokens by group/i })
    await user.selectOptions(group, 'accent')

    expect(screen.getByText('Showing 2 of 6')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: /token table/i })
    expect(within(table).getByText('accent.aqua')).toBeInTheDocument()
    expect(within(table).getByText('accent.coral')).toBeInTheDocument()
  })

  it('exports the filtered token table as CSV', async () => {
    const user = userEvent.setup()

    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:tokens')

    render(<App />)

    const search = screen.getByRole('searchbox', { name: /search tokens/i })
    await user.type(search, 'accent.coral')

    await user.click(screen.getByRole('button', { name: /download filtered tokens as csv/i }))

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1)

    createObjectURLSpy.mockRestore()
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

  it('renders the contrast helper', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /contrast helper/i })).toBeInTheDocument()
    expect(screen.getByText(/^ratio$/i)).toBeInTheDocument()
    expect(screen.getByText(/^aa \(normal\)$/i)).toBeInTheDocument()
  })
})
