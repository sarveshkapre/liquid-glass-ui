type TokenCsvItem = {
  name: string
  value: string
  description: string
  usedBy?: string[]
}

function buildTokensCsv(tokens: TokenCsvItem[]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`
  const header = ['name', 'value', 'description', 'usedBy'].join(',')
  const lines = tokens.map((token) => {
    const usedBy = (token.usedBy ?? []).join('; ')
    return [token.name, token.value, token.description, usedBy].map(escape).join(',')
  })
  return `${header}\n${lines.join('\n')}\n`
}

export type { TokenCsvItem }
export { buildTokensCsv }

