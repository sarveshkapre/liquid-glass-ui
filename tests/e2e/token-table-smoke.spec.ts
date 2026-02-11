import { expect, test } from '@playwright/test'

test('token table edit/import/export smoke path', async ({ page }) => {
  await page.goto('/')

  const table = page.getByRole('table', { name: /token table/i })
  await expect(table).toBeVisible()

  const accentCoralRow = table.getByRole('row', { name: /accent\.coral/i })

  await accentCoralRow.getByRole('button', { name: 'Edit accent.coral (table)' }).click()
  const editValueInput = page.getByRole('textbox', { name: 'Edit value for accent.coral' })
  await editValueInput.fill('#121212')
  await editValueInput.press('Escape')
  await expect(accentCoralRow).toContainText('#ff9f7a')

  await accentCoralRow.getByRole('button', { name: 'Edit accent.coral (table)' }).click()
  const editValueInput2 = page.getByRole('textbox', { name: 'Edit value for accent.coral' })
  await editValueInput2.fill('#000000')
  await editValueInput2.press('Enter')

  await expect(accentCoralRow).toContainText('#000000')
  await expect(
    page.getByText(/edits status: 1 overrides \| undo depth 1 \| redo depth 0/i),
  ).toBeVisible()

  // Focus the token-table surface so the <details onKeyDownCapture> handler receives shortcuts,
  // without toggling the open/closed state (which would hide the table from the a11y tree).
  await page.locator('details.token-table > summary').focus()
  await page.keyboard.press('Control+Z')
  await expect(accentCoralRow).toContainText('#ff9f7a')

  await page.locator('details.token-table > summary').focus()
  await page.keyboard.press('Control+Shift+Z')
  await expect(accentCoralRow).toContainText('#000000')

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

  await page.getByRole('button', { name: /reset local token edits/i }).click()
  await expect(accentCoralRow).toContainText('#ff9f7a')

  const importedEditsFile = {
    version: 1,
    overrides: {
      'accent.coral': {
        value: '#00ff9d',
        description: 'Playwright smoke drag-drop value',
        usedBy: ['Smoke test'],
      },
    },
  }

  await page.getByRole('button', { name: /import token edits json/i }).click()
  const importDialog = page.getByRole('dialog', { name: /import token edits/i })
  await expect(importDialog).toBeVisible()

  const dataTransfer = await page.evaluateHandle(
    ({ text, name }) => {
      const dt = new DataTransfer()
      dt.items.add(new File([text], name, { type: 'application/json' }))
      return dt
    },
    { text: JSON.stringify(importedEditsFile), name: 'edits.json' },
  )

  await importDialog.dispatchEvent('drop', { dataTransfer })
  await expect(page.getByText(/ready to import 1 edits/i)).toBeVisible()
  await page.getByRole('button', { name: /apply imported edits/i }).click()

  await expect(accentCoralRow).toContainText('#00ff9d')

  const csvDownloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /download filtered tokens as csv/i }).click()
  const csvDownload = await csvDownloadPromise
  expect(csvDownload.suggestedFilename()).toBe('liquid-glass-tokens.csv')
})
