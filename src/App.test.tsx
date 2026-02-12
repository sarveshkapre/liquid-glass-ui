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

  it('copies a token JSON snippet to the clipboard', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Copy JSON for glass.blur.24' }))

    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('"name": "glass.blur.24"'))
    })
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

  it('hydrates token table filters from URL query params', () => {
    window.history.replaceState(
      {},
      '',
      '/?tokenQuery=accent&tokenGroup=accent&tokenUsedBy=Buttons',
    )

    render(<App />)

    expect(screen.getByRole('searchbox', { name: /search tokens/i })).toHaveValue('accent')
    expect(screen.getByRole('combobox', { name: /filter tokens by group/i })).toHaveValue(
      'accent',
    )
    expect(screen.getByRole('combobox', { name: /filter tokens by usage/i })).toHaveValue(
      'Buttons',
    )
    expect(screen.getByText('Showing 1 of 6')).toBeInTheDocument()
  })

  it('writes token table filters to URL query params', async () => {
    const user = userEvent.setup()
    render(<App />)

    const search = screen.getByRole('searchbox', { name: /search tokens/i })
    const group = screen.getByRole('combobox', { name: /filter tokens by group/i })
    const usedBy = screen.getByRole('combobox', { name: /filter tokens by usage/i })

    await user.type(search, 'accent')
    await user.selectOptions(group, 'accent')
    await user.selectOptions(usedBy, 'Buttons')

    const params = new URLSearchParams(window.location.search)
    expect(params.get('tokenQuery')).toBe('accent')
    expect(params.get('tokenGroup')).toBe('accent')
    expect(params.get('tokenUsedBy')).toBe('Buttons')

    await user.clear(search)
    await user.selectOptions(group, 'all')
    await user.selectOptions(usedBy, 'all')

    const cleared = new URLSearchParams(window.location.search)
    expect(cleared.get('tokenQuery')).toBeNull()
    expect(cleared.get('tokenGroup')).toBeNull()
    expect(cleared.get('tokenUsedBy')).toBeNull()
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

  it('copies a token row from the table', async () => {
    const user = userEvent.setup()
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

    render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })
    await user.click(
      within(table).getByRole('button', { name: 'Copy row for accent.coral (table)' }),
    )

    expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('accent.coral\t#ff9f7a'))
  })

  it('supports inline edits in the token table', async () => {
    const user = userEvent.setup()
    render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })
    expect(
      screen.getByText(/edits status: 0 overrides \| undo depth 0 \| redo depth 0/i),
    ).toBeInTheDocument()

    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))

    const valueInput = screen.getByRole('textbox', { name: 'Edit value for accent.coral' })
    await user.clear(valueInput)
    await user.type(valueInput, '#000000')

    await user.click(screen.getByRole('button', { name: 'Save edits for accent.coral' }))

    expect(within(table).getByText('#000000')).toBeInTheDocument()
    expect(
      screen.getByText(/edits status: 1 overrides \| undo depth 1 \| redo depth 0/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /undo last token edit/i }))
    expect(within(table).getByText('#ff9f7a')).toBeInTheDocument()
    expect(
      screen.getByText(/edits status: 0 overrides \| undo depth 0 \| redo depth 1/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /redo last token edit/i }))
    expect(within(table).getByText('#000000')).toBeInTheDocument()
    expect(
      screen.getByText(/edits status: 1 overrides \| undo depth 1 \| redo depth 0/i),
    ).toBeInTheDocument()
  })

  it('supports Escape cancel and Enter save while editing token rows', async () => {
    const user = userEvent.setup()
    render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })
    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))

    const valueInput = screen.getByRole('textbox', { name: 'Edit value for accent.coral' })
    await user.clear(valueInput)
    await user.type(valueInput, '#010101')
    fireEvent.keyDown(valueInput, { key: 'Escape' })

    expect(within(table).getByText('#ff9f7a')).toBeInTheDocument()
    expect(
      screen.getByText(/edits status: 0 overrides \| undo depth 0 \| redo depth 0/i),
    ).toBeInTheDocument()

    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))
    const valueInput2 = screen.getByRole('textbox', { name: 'Edit value for accent.coral' })
    await user.clear(valueInput2)
    await user.type(valueInput2, '#010101')
    fireEvent.keyDown(valueInput2, { key: 'Enter' })

    expect(within(table).getByText('#010101')).toBeInTheDocument()
  })

  it('supports Ctrl+Enter save from description textarea', async () => {
    const user = userEvent.setup()
    render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })
    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))

    const descriptionInput = screen.getByRole('textbox', {
      name: 'Edit description for accent.coral',
    })
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')
    fireEvent.keyDown(descriptionInput, { key: 'Enter', ctrlKey: true })

    expect(within(table).getByText('Updated description')).toBeInTheDocument()
  })

  it('restores saved token overrides after remount', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })
    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))
    const valueInput = screen.getByRole('textbox', { name: 'Edit value for accent.coral' })
    await user.clear(valueInput)
    await user.type(valueInput, '#101010')
    await user.click(screen.getByRole('button', { name: 'Save edits for accent.coral' }))
    expect(within(table).getByText('#101010')).toBeInTheDocument()

    unmount()
    render(<App />)

    const remountedTable = screen.getByRole('table', { name: /token table/i })
    expect(within(remountedTable).getByText('#101010')).toBeInTheDocument()
  })

  it('supports Ctrl+Z / Ctrl+Shift+Z shortcuts inside the token table', async () => {
    const user = userEvent.setup()
    render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })

    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))
    const valueInput = screen.getByRole('textbox', { name: 'Edit value for accent.coral' })
    await user.clear(valueInput)
    await user.type(valueInput, '#000000')
    await user.click(screen.getByRole('button', { name: 'Save edits for accent.coral' }))

    const exportCsv = screen.getByRole('button', { name: /download filtered tokens as csv/i })
    exportCsv.focus()

    fireEvent.keyDown(exportCsv, { key: 'z', ctrlKey: true })
    expect(within(table).getByText('#ff9f7a')).toBeInTheDocument()

    fireEvent.keyDown(exportCsv, { key: 'z', ctrlKey: true, shiftKey: true })
    expect(within(table).getByText('#000000')).toBeInTheDocument()
  })

  it('resets local token edits and clears edit-status counts', async () => {
    const user = userEvent.setup()
    render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })
    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))

    const valueInput = screen.getByRole('textbox', { name: 'Edit value for accent.coral' })
    await user.clear(valueInput)
    await user.type(valueInput, '#000000')
    await user.click(screen.getByRole('button', { name: 'Save edits for accent.coral' }))

    expect(
      screen.getByText(/edits status: 1 overrides \| undo depth 1 \| redo depth 0/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reset local token edits/i }))

    expect(within(table).getByText('#ff9f7a')).toBeInTheDocument()
    expect(
      screen.getByText(/edits status: 0 overrides \| undo depth 2 \| redo depth 0/i),
    ).toBeInTheDocument()
  })

  it('exports local token edits as JSON', async () => {
    const user = userEvent.setup()

    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:edits')

    render(<App />)

    const table = screen.getByRole('table', { name: /token table/i })
    await user.click(within(table).getByRole('button', { name: 'Edit accent.coral (table)' }))

    const valueInput = screen.getByRole('textbox', { name: 'Edit value for accent.coral' })
    await user.clear(valueInput)
    await user.type(valueInput, '#000000')

    await user.click(screen.getByRole('button', { name: 'Save edits for accent.coral' }))
    await user.click(screen.getByRole('button', { name: /export local token edits as json/i }))

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1)
    createObjectURLSpy.mockRestore()
  })

  it('imports local token edits from JSON', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /import token edits json/i }))

    const edits = {
      version: 1,
      overrides: {
        'accent.coral': { value: '#000000' },
      },
    }

    fireEvent.change(screen.getByRole('textbox', { name: /edits json/i }), {
      target: { value: JSON.stringify(edits) },
    })
    await user.click(screen.getByRole('button', { name: /apply imported edits/i }))

    const table = screen.getByRole('table', { name: /token table/i })
    expect(within(table).getByText('#000000')).toBeInTheDocument()
  })

  it('imports edits via drag-and-drop JSON file', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /import token edits json/i }))

    const edits = JSON.stringify({
      version: 1,
      overrides: {
        'accent.coral': { value: '#000000' },
      },
    })

    const file = new File([edits], 'liquid-glass-token-edits.json', {
      type: 'application/json',
    })

    const dialog = screen.getByRole('dialog', { name: /import token edits/i })
    fireEvent.drop(dialog, { dataTransfer: { files: [file] } })

    await waitFor(() => {
      expect((screen.getByRole('textbox', { name: /edits json/i }) as HTMLTextAreaElement).value).toContain(
        'accent.coral',
      )
    })

    await user.click(screen.getByRole('button', { name: /apply imported edits/i }))

    const table = screen.getByRole('table', { name: /token table/i })
    expect(within(table).getByText('#000000')).toBeInTheDocument()
  })

  it('disables Apply when import JSON is invalid', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /import token edits json/i }))

    const apply = screen.getByRole('button', { name: /apply imported edits/i })
    expect(apply).toBeDisabled()

    fireEvent.change(screen.getByRole('textbox', { name: /edits json/i }), {
      target: {
        value: JSON.stringify({
          version: 1,
          overrides: { 'accent.coral': { value: '#000000' } },
        }),
      },
    })

    expect(apply).not.toBeDisabled()
  })

  it('links the import schema from the import dialog', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /import token edits json/i }))

    expect(
      screen.getByRole('link', {
        name: /liquid-glass-token-edits\.v1\.schema\.json/i,
      }),
    ).toHaveAttribute('href', '/schemas/liquid-glass-token-edits.v1.schema.json')
  })

  it('requires version 1 for imported edits JSON', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /import token edits json/i }))

    const apply = screen.getByRole('button', { name: /apply imported edits/i })

    fireEvent.change(screen.getByRole('textbox', { name: /edits json/i }), {
      target: {
        value: JSON.stringify({
          overrides: { 'accent.coral': { value: '#000000' } },
        }),
      },
    })

    expect(apply).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(/missing "version"/i)

    fireEvent.change(screen.getByRole('textbox', { name: /edits json/i }), {
      target: {
        value: JSON.stringify({
          version: 2,
          overrides: { 'accent.coral': { value: '#000000' } },
        }),
      },
    })

    expect(apply).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(/unsupported edits json version/i)
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
