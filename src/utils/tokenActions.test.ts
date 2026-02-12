import { describe, expect, it } from 'vitest'
import {
  buildTokenCopySuccessMessage,
  buildTokenCopyText,
  toEditableUsedByValue,
} from './tokenActions'

describe('tokenActions', () => {
  const token = {
    name: 'accent.coral',
    value: '#ff9f7a',
    description: 'Secondary accent for warmth.',
    usedBy: ['Hero orb', 'Accent swatches'],
  }

  it('builds copy payloads for each supported format', () => {
    expect(buildTokenCopyText(token, 'value')).toBe('#ff9f7a')
    expect(buildTokenCopyText(token, 'css')).toBe('--lg-accent-coral: #ff9f7a;')
    expect(buildTokenCopyText(token, 'json')).toContain('"name": "accent.coral"')
    expect(buildTokenCopyText(token, 'row')).toBe(
      'accent.coral\t#ff9f7a\tSecondary accent for warmth.\tHero orb; Accent swatches\n',
    )
  })

  it('builds copy success messages', () => {
    expect(buildTokenCopySuccessMessage('accent.coral', 'value')).toBe(
      'Copied accent.coral value',
    )
    expect(buildTokenCopySuccessMessage('accent.coral', 'css')).toBe(
      'Copied accent.coral CSS',
    )
    expect(buildTokenCopySuccessMessage('accent.coral', 'json')).toBe(
      'Copied accent.coral JSON',
    )
    expect(buildTokenCopySuccessMessage('accent.coral', 'row')).toBe(
      'Copied accent.coral row',
    )
  })

  it('returns a comma-separated used-by edit value', () => {
    expect(toEditableUsedByValue(['Hero orb', 'Accent swatches'])).toBe(
      'Hero orb, Accent swatches',
    )
    expect(toEditableUsedByValue(undefined)).toBe('')
  })
})
