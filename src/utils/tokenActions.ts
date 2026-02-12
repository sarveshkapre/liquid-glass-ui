type TokenActionItem = {
  name: string
  value: string
  description: string
  usedBy?: string[]
}

type TokenCopyFormat = 'value' | 'css' | 'json' | 'row'

function toCssVarName(tokenName: string) {
  return `--lg-${tokenName.replaceAll('.', '-')}`
}

function toTokenJson(token: TokenActionItem) {
  return `${JSON.stringify(token, null, 2)}\n`
}

function toTokenRowText(token: TokenActionItem) {
  const usedBy = (token.usedBy ?? []).join('; ')
  return `${token.name}\t${token.value}\t${token.description}\t${usedBy}\n`
}

function buildTokenCopyText(token: TokenActionItem, format: TokenCopyFormat) {
  if (format === 'value') {
    return token.value
  }
  if (format === 'css') {
    return `${toCssVarName(token.name)}: ${token.value};`
  }
  if (format === 'json') {
    return toTokenJson(token)
  }
  return toTokenRowText(token)
}

function buildTokenCopySuccessMessage(tokenName: string, format: TokenCopyFormat) {
  if (format === 'value') {
    return `Copied ${tokenName} value`
  }
  if (format === 'css') {
    return `Copied ${tokenName} CSS`
  }
  if (format === 'json') {
    return `Copied ${tokenName} JSON`
  }
  return `Copied ${tokenName} row`
}

function toEditableUsedByValue(usedBy?: string[]) {
  return (usedBy ?? []).join(', ')
}

export {
  buildTokenCopySuccessMessage,
  buildTokenCopyText,
  toEditableUsedByValue,
}
export type { TokenActionItem, TokenCopyFormat }
