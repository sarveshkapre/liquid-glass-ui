type TokenEditsOverride = {
  value?: string
  description?: string
  usedBy?: string[]
  $extensions?: Record<string, unknown>
}

type TokenEditsFile = {
  version?: unknown
  overrides?: unknown
}

type ImportEditsResult = {
  overrides: Record<string, TokenEditsOverride>
  ignoredCount: number
  errors: string[]
}

function serializeTokenEditsFileV1(
  overrides: Record<string, TokenEditsOverride>,
  generatedAt: string = new Date().toISOString(),
) {
  const payload = {
    version: 1,
    generatedAt,
    overrides,
  }

  return `${JSON.stringify(payload, null, 2)}\n`
}

function parseTokenEditsJson(
  jsonText: string,
  allowedTokenNames: Set<string>,
): ImportEditsResult {
  const trimmed = jsonText.trim()
  if (!trimmed) {
    return { overrides: {}, ignoredCount: 0, errors: ['Paste edits JSON to import.'] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return { overrides: {}, ignoredCount: 0, errors: ['Invalid JSON.'] }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { overrides: {}, ignoredCount: 0, errors: ['Invalid edits JSON.'] }
  }

  const { overrides, version } = parsed as TokenEditsFile

  if (version === undefined) {
    return { overrides: {}, ignoredCount: 0, errors: ['Missing "version" (expected 1).'] }
  }
  if (typeof version !== 'number' || !Number.isFinite(version)) {
    return { overrides: {}, ignoredCount: 0, errors: ['Invalid "version" (expected 1).'] }
  }
  if (version !== 1) {
    return {
      overrides: {},
      ignoredCount: 0,
      errors: [`Unsupported edits JSON version: ${version} (expected 1).`],
    }
  }

  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    return { overrides: {}, ignoredCount: 0, errors: ['Missing "overrides" object.'] }
  }

  const nextOverrides: Record<string, TokenEditsOverride> = {}
  let ignoredCount = 0

  for (const [name, override] of Object.entries(overrides as Record<string, unknown>)) {
    if (!allowedTokenNames.has(name)) {
      ignoredCount += 1
      continue
    }
    if (!override || typeof override !== 'object' || Array.isArray(override)) {
      ignoredCount += 1
      continue
    }

    const candidate = override as Partial<TokenEditsOverride>
    const cleaned: TokenEditsOverride = {}

    if (typeof candidate.value === 'string') cleaned.value = candidate.value
    if (typeof candidate.description === 'string') cleaned.description = candidate.description
    if (
      Array.isArray(candidate.usedBy) &&
      candidate.usedBy.every((entry) => typeof entry === 'string' && entry.trim().length > 0)
    ) {
      cleaned.usedBy = candidate.usedBy
    }
    if (
      candidate.$extensions &&
      typeof candidate.$extensions === 'object' &&
      !Array.isArray(candidate.$extensions)
    ) {
      cleaned.$extensions = candidate.$extensions
    }

    if (Object.keys(cleaned).length > 0) {
      nextOverrides[name] = cleaned
    } else {
      ignoredCount += 1
    }
  }

  const errors: string[] = []
  if (Object.keys(nextOverrides).length === 0) {
    errors.push('No valid overrides found.')
  }

  return { overrides: nextOverrides, ignoredCount, errors }
}

export type { ImportEditsResult, TokenEditsOverride }
export { parseTokenEditsJson, serializeTokenEditsFileV1 }
