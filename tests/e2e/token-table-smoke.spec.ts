import { expect, test } from '@playwright/test'

test('token table edit/import/export smoke path', async ({ page }) => {
  await page.goto('/')

  const table = page.getByRole('table', { name: /token table/i })
  await expect(table).toBeVisible()

  const accentCoralRow = table.getByRole('row', { name: /accent\.coral/i })

  await accentCoralRow.getByRole('button', { name: 'Edit accent.coral (table)' }).click()
  await page.getByRole('textbox', { name: 'Edit value for accent.coral' }).fill('#000000')
  await page.getByRole('button', { name: 'Save edits for accent.coral' }).click()

  await expect(accentCoralRow).toContainText('#000000')
  await expect(
    page.getByText(/edits status: 1 overrides \| undo depth 1 \| redo depth 0/i),
  ).toBeVisible()

  await page.getByRole('button', { name: /undo last token edit/i }).click()
  await expect(accentCoralRow).toContainText('#ff9f7a')

  await page.getByRole('button', { name: /redo last token edit/i }).click()
  await expect(accentCoralRow).toContainText('#000000')

  const editsDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /export local token edits as json/i }).click()
  const editsDownload = await editsDownloadPromise
  expect(editsDownload.suggestedFilename()).toBe('liquid-glass-token-edits.json')

  const importedEdits = {
    version: 1,
    overrides: {
      'accent.coral': {
        value: '#2364ff',
        description: 'Playwright smoke import value',
        usedBy: ['Smoke test'],
      },
    },
  }

  await page.getByRole('button', { name: /import token edits json/i }).click()
  await page
    .getByRole('textbox', { name: /edits json/i })
    .fill(JSON.stringify(importedEdits))
  await page.getByRole('button', { name: /apply imported edits/i }).click()

  await expect(accentCoralRow).toContainText('#2364ff')

  const csvDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /download filtered tokens as csv/i }).click()
  const csvDownload = await csvDownloadPromise
  expect(csvDownload.suggestedFilename()).toBe('liquid-glass-tokens.csv')
})
