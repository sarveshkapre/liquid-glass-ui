import { useEffect, useMemo, useRef, useState } from 'react'

type TokenOverride = {
  value?: string
  description?: string
  usedBy?: string[]
  $extensions?: Record<string, unknown>
}

type TokenOverrides = Record<string, TokenOverride>

const TOKEN_OVERRIDE_HISTORY_LIMIT = 100
const TOKEN_OVERRIDES_STORAGE_KEY = 'lg-token-overrides.v1'

type PersistedTokenOverridesPayload = {
  version?: unknown
  overrides?: unknown
}

type UseTokenOverridesOptions = {
  storageKey?: string
  allowedTokenNames?: ReadonlySet<string>
}

function pushHistorySnapshot(
  history: TokenOverrides[],
  snapshot: TokenOverrides,
) {
  const next = [...history, snapshot]
  return next.length > TOKEN_OVERRIDE_HISTORY_LIMIT
    ? next.slice(next.length - TOKEN_OVERRIDE_HISTORY_LIMIT)
    : next
}

function sanitizeTokenOverrides(
  value: unknown,
  allowedTokenNames?: ReadonlySet<string>,
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const next: TokenOverrides = {}

  for (const [tokenName, override] of Object.entries(value as Record<string, unknown>)) {
    if (allowedTokenNames && !allowedTokenNames.has(tokenName)) {
      continue
    }
    if (!override || typeof override !== 'object' || Array.isArray(override)) {
      continue
    }

    const raw = override as Partial<TokenOverride>
    const cleaned: TokenOverride = {}

    if (typeof raw.value === 'string') {
      cleaned.value = raw.value
    }
    if (typeof raw.description === 'string') {
      cleaned.description = raw.description
    }
    if (Array.isArray(raw.usedBy)) {
      const usedBy = raw.usedBy
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
      if (usedBy.length > 0) {
        cleaned.usedBy = Array.from(new Set(usedBy))
      }
    }
    if (
      raw.$extensions &&
      typeof raw.$extensions === 'object' &&
      !Array.isArray(raw.$extensions)
    ) {
      cleaned.$extensions = raw.$extensions
    }

    if (Object.keys(cleaned).length > 0) {
      next[tokenName] = cleaned
    }
  }

  return next
}

function readStoredTokenOverrides(
  storageKey: string,
  allowedTokenNames?: ReadonlySet<string>,
) {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    if (!stored) {
      return {}
    }

    const parsed = JSON.parse(stored) as PersistedTokenOverridesPayload
    const candidate =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'overrides' in parsed
        ? parsed.overrides
        : parsed

    return sanitizeTokenOverrides(candidate, allowedTokenNames)
  } catch {
    return {}
  }
}

export function useTokenOverrides(options: UseTokenOverridesOptions = {}) {
  const {
    storageKey = TOKEN_OVERRIDES_STORAGE_KEY,
    allowedTokenNames,
  } = options
  const [tokenOverrides, setTokenOverrides] = useState<TokenOverrides>(() =>
    readStoredTokenOverrides(storageKey, allowedTokenNames),
  )
  const tokenOverridesRef = useRef(tokenOverrides)
  const [tokenOverrideUndoStack, setTokenOverrideUndoStack] = useState<TokenOverrides[]>([])
  const [tokenOverrideRedoStack, setTokenOverrideRedoStack] = useState<TokenOverrides[]>([])

  useEffect(() => {
    tokenOverridesRef.current = tokenOverrides
  }, [tokenOverrides])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      if (Object.keys(tokenOverrides).length === 0) {
        window.localStorage.removeItem(storageKey)
        return
      }

      const payload = {
        version: 1,
        overrides: tokenOverrides,
      }
      window.localStorage.setItem(storageKey, JSON.stringify(payload))
    } catch {
      // Ignore storage write errors (quota/privacy mode).
    }
  }, [storageKey, tokenOverrides])

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
