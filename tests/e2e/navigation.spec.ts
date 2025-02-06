import { test, expect } from '@playwright/test'

test('desktop dropdown has proper ARIA labels', async ({ page }) => {
  await page.goto('/')
  const menuButton = page.getByRole('button', { name: /dinner/i })
  await menuButton.click()
  
  const dropdown = page.getByRole('menu')
  await expect(dropdown).toBeVisible()
  await expect(dropdown.getByRole('menuitem')).toHaveCount(5) // Update with actual subcategory count
}) 