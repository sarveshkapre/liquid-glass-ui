import { describe, expect, it } from 'vitest'
import { parseTokenEditsJson, serializeTokenEditsFileV1 } from './tokenEdits'

describe('tokenEdits', () => {
  it('serializes a versioned edits file (v1) with a trailing newline', () => {
    const json = serializeTokenEditsFileV1(
      { 'accent.coral': { value: '#000000' } },
      '2026-02-10T00:00:00.000Z',
    )

    expect(json.endsWith('\n')).toBe(true)
    expect(json).toContain('"version": 1')
    expect(json).toContain('"generatedAt": "2026-02-10T00:00:00.000Z"')
    expect(json).toContain('"accent.coral"')
    expect(json).toContain('"value": "#000000"')
  })

  it('rejects empty input', () => {
    const result = parseTokenEditsJson('   ', new Set(['accent.coral']))
    expect(result.errors).toEqual(['Paste edits JSON to import.'])
    expect(result.overrides).toEqual({})
    expect(result.ignoredCount).toBe(0)
  })

  it('rejects invalid JSON', () => {
    const result = parseTokenEditsJson('{', new Set(['accent.coral']))
    expect(result.errors).toEqual(['Invalid JSON.'])
  })

  it('requires a finite numeric version == 1', () => {
    const allowed = new Set(['accent.coral'])

    expect(parseTokenEditsJson(JSON.stringify({ overrides: {} }), allowed).errors[0]).toMatch(
      /missing "version"/i,
    )

    expect(parseTokenEditsJson(JSON.stringify({ version: '1', overrides: {} }), allowed).errors[0]).toMatch(
      /invalid "version"/i,
    )

    expect(parseTokenEditsJson(JSON.stringify({ version: 2, overrides: {} }), allowed).errors[0]).toMatch(
      /unsupported edits json version/i,
    )
  })

  it('requires an overrides object', () => {
    const allowed = new Set(['accent.coral'])

    expect(parseTokenEditsJson(JSON.stringify({ version: 1 }), allowed).errors[0]).toMatch(
      /missing "overrides"/i,
    )
    expect(
      parseTokenEditsJson(JSON.stringify({ version: 1, overrides: [] }), allowed).errors[0],
    ).toMatch(/missing "overrides"/i)
  })

  it('filters overrides by allowed token names and cleans override fields', () => {
    const allowed = new Set(['accent.coral', 'accent.aqua'])

    const result = parseTokenEditsJson(
      JSON.stringify({
        version: 1,
        overrides: {
          'accent.coral': { value: '#000000', usedBy: ['OK', '  '] },
          'accent.aqua': { description: 'Hi', usedBy: ['Focus ring'] },
          'unknown.token': { value: '#fff' },
          'accent.coral.bad': 'nope',
        },
      }),
      allowed,
    )

    expect(result.errors).toEqual([])
    expect(result.overrides).toEqual({
      'accent.coral': { value: '#000000' },
      'accent.aqua': { description: 'Hi', usedBy: ['Focus ring'] },
    })
    expect(result.ignoredCount).toBe(2)
  })

  it('returns an error when nothing valid remains', () => {
    const allowed = new Set(['accent.coral'])
    const result = parseTokenEditsJson(
      JSON.stringify({ version: 1, overrides: { 'accent.coral': { usedBy: [''] } } }),
      allowed,
    )
    expect(result.overrides).toEqual({})
    expect(result.errors).toEqual(['No valid overrides found.'])
    expect(result.ignoredCount).toBe(1)
  })
})

