import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTokenOverrides } from './useTokenOverrides'

function RedoHarness() {
  const {
    applyTokenOverrides,
    redoTokenOverride,
    tokenOverrideRedoStack,
    tokenOverrideUndoStack,
    tokenOverrides,
    undoTokenOverride,
  } = useTokenOverrides()

  const accent = tokenOverrides['accent.coral']?.value ?? '(unset)'

  return (
    <div>
      <div aria-label="accent value">{accent}</div>
      <div aria-label="undo depth">{tokenOverrideUndoStack.length}</div>
      <div aria-label="redo depth">{tokenOverrideRedoStack.length}</div>
      <button
        type="button"
        onClick={() =>
          applyTokenOverrides((current) => ({
            ...current,
            'accent.coral': { value: '#000000' },
          }))
        }
      >
        apply-1
      </button>
      <button
        type="button"
        onClick={() =>
          applyTokenOverrides((current) => ({
            ...current,
            'accent.coral': { value: '#111111' },
          }))
        }
      >
        apply-2
      </button>
      <button
        type="button"
        onClick={() =>
          applyTokenOverrides((current) => ({
            ...current,
            'accent.coral': { value: '#222222' },
          }))
        }
      >
        apply-3
      </button>
      <button type="button" onClick={undoTokenOverride}>
        undo
      </button>
      <button type="button" onClick={redoTokenOverride}>
        redo
      </button>
    </div>
  )
}

function HistoryCapHarness() {
  const {
    applyTokenOverrides,
    tokenOverrideUndoStack,
    tokenOverrides,
    undoTokenOverride,
  } = useTokenOverrides()

  return (
    <div>
      <div aria-label="override count">{Object.keys(tokenOverrides).length}</div>
      <div aria-label="undo depth">{tokenOverrideUndoStack.length}</div>
      <button
        type="button"
        onClick={() =>
          applyTokenOverrides((current) => {
            const nextIndex = Object.keys(current).length
            return {
              ...current,
              [`t${nextIndex}`]: { value: String(nextIndex) },
            }
          })
        }
      >
        apply
      </button>
      <button type="button" onClick={undoTokenOverride}>
        undo
      </button>
    </div>
  )
}

const storageAllowedTokenNames = new Set(['accent.coral'])

function StorageHarness() {
  const { applyTokenOverrides, tokenOverrides } = useTokenOverrides({
    storageKey: 'test-token-overrides',
    allowedTokenNames: storageAllowedTokenNames,
  })

  return (
    <div>
      <div aria-label="accent value">{tokenOverrides['accent.coral']?.value ?? '(unset)'}</div>
      <button
        type="button"
        onClick={() =>
          applyTokenOverrides((current) => ({
            ...current,
            'accent.coral': { value: '#123456' },
          }))
        }
      >
        apply
      </button>
      <button type="button" onClick={() => applyTokenOverrides(() => ({}))}>
        clear
      </button>
    </div>
  )
}

describe('useTokenOverrides', () => {
  it('clears redo stack on new edits', () => {
    render(<RedoHarness />)

    fireEvent.click(screen.getByText('apply-1'))
    expect(screen.getByLabelText('accent value')).toHaveTextContent('#000000')
    expect(screen.getByLabelText('undo depth')).toHaveTextContent('1')
    expect(screen.getByLabelText('redo depth')).toHaveTextContent('0')

    fireEvent.click(screen.getByText('apply-2'))
    expect(screen.getByLabelText('accent value')).toHaveTextContent('#111111')
    expect(screen.getByLabelText('undo depth')).toHaveTextContent('2')
    expect(screen.getByLabelText('redo depth')).toHaveTextContent('0')

    fireEvent.click(screen.getByText('undo'))
    expect(screen.getByLabelText('accent value')).toHaveTextContent('#000000')
    expect(screen.getByLabelText('undo depth')).toHaveTextContent('1')
    expect(screen.getByLabelText('redo depth')).toHaveTextContent('1')

    fireEvent.click(screen.getByText('apply-3'))
    expect(screen.getByLabelText('accent value')).toHaveTextContent('#222222')
    expect(screen.getByLabelText('redo depth')).toHaveTextContent('0')
  })

  it('caps undo history to the configured limit', () => {
    render(<HistoryCapHarness />)

    const apply = screen.getByText('apply')
    const undo = screen.getByText('undo')

    for (let i = 0; i < 105; i += 1) {
      fireEvent.click(apply)
    }

    expect(screen.getByLabelText('override count')).toHaveTextContent('105')
    expect(screen.getByLabelText('undo depth')).toHaveTextContent('100')

    for (let i = 0; i < 100; i += 1) {
      fireEvent.click(undo)
    }

    // With a 100-snapshot cap, after 105 edits we can only undo back to state #5.
    expect(screen.getByLabelText('override count')).toHaveTextContent('5')
  })

  it('hydrates persisted token overrides and filters unknown tokens', () => {
    window.localStorage.setItem(
      'test-token-overrides',
      JSON.stringify({
        version: 1,
        overrides: {
          'accent.coral': { value: '#fedcba' },
          'unknown.token': { value: '#000000' },
        },
      }),
    )

    render(<StorageHarness />)

    expect(screen.getByLabelText('accent value')).toHaveTextContent('#fedcba')
  })

  it('persists token overrides to localStorage using versioned payload', () => {
    render(<StorageHarness />)

    fireEvent.click(screen.getByText('apply'))

    const persistedRaw = window.localStorage.getItem('test-token-overrides')
    expect(persistedRaw).not.toBeNull()

    const persisted = JSON.parse(String(persistedRaw)) as {
      version: number
      overrides: Record<string, { value?: string }>
    }
    expect(persisted.version).toBe(1)
    expect(persisted.overrides['accent.coral']?.value).toBe('#123456')
  })

  it('removes persisted overrides when edits are cleared', () => {
    render(<StorageHarness />)

    fireEvent.click(screen.getByText('apply'))
    expect(window.localStorage.getItem('test-token-overrides')).not.toBeNull()

    fireEvent.click(screen.getByText('clear'))
    expect(window.localStorage.getItem('test-token-overrides')).toBeNull()
  })
})
