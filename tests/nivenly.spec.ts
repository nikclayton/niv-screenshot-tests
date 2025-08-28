import {test, expect, Locator, Page} from '@playwright/test';
import {PageAssertionsToHaveScreenshotOptions} from "playwright/types/test";

test('homepage', async ({ page }) => {
    await page.goto('/');
    await expectScreenshotWithRetries(page, 'homepage.png', { fullPage: true });
})

// - Possible fix for https://github.com/microsoft/playwright/pull/36234
// - Name param is to work around an issue where a number could be appended
//   to the auto-generated name (so "homepage" becomes "homepage-1", maybe
//   "homepage-2", etc). Passing an explicit name appears to fix that.
async function expectScreenshotWithRetries(
    element: Page | Locator,
    name: string|ReadonlyArray<string>,
    options?: PageAssertionsToHaveScreenshotOptions
)  {
    let maxAttempts = 5

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
        try {
            return await expect(element).toHaveScreenshot(name, options)
        } catch (error) {
            lastError = error
            console.warn(
                `Screenshot attempt ${attempt} failed: `,
                error instanceof Error ? error.message : error
            )
            if (attempt == maxAttempts) break;

            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    throw lastError || new Error("Screenshot failed after $maxAttempts")
}