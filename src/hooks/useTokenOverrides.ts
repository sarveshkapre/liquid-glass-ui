import { useEffect, useMemo, useRef, useState } from 'react'

type TokenOverride = {
  value?: string
  description?: string
  usedBy?: string[]
}

type TokenOverrides = Record<string, TokenOverride>

const TOKEN_OVERRIDE_HISTORY_LIMIT = 100

function pushHistorySnapshot(
  history: TokenOverrides[],
  snapshot: TokenOverrides,
) {
  const next = [...history, snapshot]
  return next.length > TOKEN_OVERRIDE_HISTORY_LIMIT
    ? next.slice(next.length - TOKEN_OVERRIDE_HISTORY_LIMIT)
    : next
}

export function useTokenOverrides() {
  const [tokenOverrides, setTokenOverrides] = useState<TokenOverrides>({})
  const tokenOverridesRef = useRef(tokenOverrides)
  const [tokenOverrideUndoStack, setTokenOverrideUndoStack] = useState<TokenOverrides[]>([])
  const [tokenOverrideRedoStack, setTokenOverrideRedoStack] = useState<TokenOverrides[]>([])

  useEffect(() => {
    tokenOverridesRef.current = tokenOverrides
  }, [tokenOverrides])

  const applyTokenOverrides = (
    updater: (current: TokenOverrides) => TokenOverrides,
  ) => {
    setTokenOverrides((current) => {
      setTokenOverrideUndoStack((history) => pushHistorySnapshot(history, current))
      setTokenOverrideRedoStack([])
      return updater(current)
    })
  }

  const undoTokenOverride = () => {
    setTokenOverrideUndoStack((history) => {
      if (history.length === 0) return history
      const previous = history[history.length - 1]
      setTokenOverrideRedoStack((redo) =>
        pushHistorySnapshot(redo, tokenOverridesRef.current),
      )
      setTokenOverrides(previous)
      return history.slice(0, -1)
    })
  }

  const redoTokenOverride = () => {
    setTokenOverrideRedoStack((redo) => {
      if (redo.length === 0) return redo
      const next = redo[redo.length - 1]
      setTokenOverrideUndoStack((history) =>
        pushHistorySnapshot(history, tokenOverridesRef.current),
      )
      setTokenOverrides(next)
      return redo.slice(0, -1)
    })
  }

  const tokenOverrideCount = useMemo(
    () => Object.keys(tokenOverrides).length,
    [tokenOverrides],
  )

  return {
    applyTokenOverrides,
    redoTokenOverride,
    tokenOverrideCount,
    tokenOverrideRedoStack,
    tokenOverrideUndoStack,
    tokenOverrides,
    undoTokenOverride,
  }
}

export type { TokenOverride, TokenOverrides }
