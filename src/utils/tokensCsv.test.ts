import { describe, expect, it } from 'vitest'
import { buildTokensCsv } from './tokensCsv'

describe('tokensCsv', () => {
  it('builds a CSV with stable headers, quoting, escaping, and a trailing newline', () => {
    const csv = buildTokensCsv([
      {
        name: 'accent.coral',
        value: '#ff9f7a',
        description: 'Coral "accent"',
        usedBy: ['Focus ring', 'Hero'],
      },
    ])

    expect(csv).toBe(
      [
        'name,value,description,usedBy',
        '"accent.coral","#ff9f7a","Coral ""accent""","Focus ring; Hero"',
        '',
      ].join('\n'),
    )
  })
})

