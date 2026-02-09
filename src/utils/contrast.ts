type Rgba = { r: number; g: number; b: number; a: number }

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function parseHexPair(value: string) {
  const parsed = Number.parseInt(value, 16)
  return Number.isFinite(parsed) ? parsed : NaN
}

function parseHexColor(input: string): Rgba | null {
  const hex = input.replace('#', '').trim()
  if (hex.length === 3) {
    const r = parseHexPair(hex[0] + hex[0])
    const g = parseHexPair(hex[1] + hex[1])
    const b = parseHexPair(hex[2] + hex[2])
    if ([r, g, b].some((component) => Number.isNaN(component))) return null
    return { r, g, b, a: 1 }
  }
  if (hex.length === 6) {
    const r = parseHexPair(hex.slice(0, 2))
    const g = parseHexPair(hex.slice(2, 4))
    const b = parseHexPair(hex.slice(4, 6))
    if ([r, g, b].some((component) => Number.isNaN(component))) return null
    return { r, g, b, a: 1 }
  }
  return null
}

function parseRgbColor(input: string): Rgba | null {
  const match = input
    .trim()
    .match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)$/i)
  if (!match) return null
  const r = Number(match[1])
  const g = Number(match[2])
  const b = Number(match[3])
  const a = match[4] === undefined ? 1 : clamp01(Number(match[4]))
  if (![r, g, b, a].every((component) => Number.isFinite(component))) return null
  if ([r, g, b].some((component) => component < 0 || component > 255)) return null
  return { r, g, b, a }
}

function parseColor(input: string): Rgba | null {
  if (input.trim().startsWith('#')) return parseHexColor(input)
  if (input.trim().startsWith('rgb')) return parseRgbColor(input)
  return null
}

function compositeOver(base: Rgba, overlay: Rgba): Rgba {
  const a = overlay.a + base.a * (1 - overlay.a)
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 }
  const r = (overlay.r * overlay.a + base.r * base.a * (1 - overlay.a)) / a
  const g = (overlay.g * overlay.a + base.g * base.a * (1 - overlay.a)) / a
  const b = (overlay.b * overlay.a + base.b * base.a * (1 - overlay.a)) / a
  return { r, g, b, a }
}

function srgbToLinear(c: number) {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(color: Rgba) {
  const r = srgbToLinear(color.r)
  const g = srgbToLinear(color.g)
  const b = srgbToLinear(color.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(fg: Rgba, bg: Rgba) {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type { Rgba }
export { compositeOver, contrastRatio, parseColor }
