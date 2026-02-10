type DownloadTextFileParams = {
  filename: string
  mimeType: string
  text: string
  revokeDelayMs?: number
}

function tryDownloadTextFile({
  filename,
  mimeType,
  text,
  revokeDelayMs = 1000,
}: DownloadTextFileParams): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    const blob = new Blob([text], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => {
      // `revokeObjectURL` may not exist in some test runtimes.
      if (typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url)
      }
    }, revokeDelayMs)

    return true
  } catch {
    return false
  }
}

export { tryDownloadTextFile }

