import { describe, expect, it } from 'vitest'
import { compositeOver, contrastRatio, parseColor } from './contrast'

describe('contrast utils', () => {
  it('parses supported hex and rgb colors', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#112233')).toEqual({ r: 17, g: 34, b: 51, a: 1 })
    expect(parseColor('rgb(12, 34, 56)')).toEqual({ r: 12, g: 34, b: 56, a: 1 })
    expect(parseColor('rgba(12, 34, 56, 0.5)')).toEqual({ r: 12, g: 34, b: 56, a: 0.5 })
  })

  it('rejects unsupported or invalid colors', () => {
    expect(parseColor('#zzzzzz')).toBeNull()
    expect(parseColor('#12')).toBeNull()
    expect(parseColor('rgb(999, 0, 0)')).toBeNull()
    expect(parseColor('hsl(0, 0%, 100%)')).toBeNull()
  })

  it('composites transparent overlays and computes WCAG ratio', () => {
    const base = { r: 0, g: 0, b: 0, a: 1 }
    const overlay = { r: 255, g: 255, b: 255, a: 0.5 }
    const composited = compositeOver(base, overlay)

    expect(composited.r).toBeCloseTo(127.5, 3)
    expect(composited.g).toBeCloseTo(127.5, 3)
    expect(composited.b).toBeCloseTo(127.5, 3)
    expect(composited.a).toBe(1)
    expect(contrastRatio({ r: 255, g: 255, b: 255, a: 1 }, base)).toBeCloseTo(21, 5)
  })
})
