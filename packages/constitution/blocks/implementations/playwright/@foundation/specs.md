# Specs

> Governs the end-to-end specs: their locators, waits, actions, retries, traces and accessibility scan.

## Cases

### locators-never-by-test-id-selector-or-handle → element-found-by-role-label-or-text · MUST

Every end-to-end spec finds elements as a user does. It finds them with `getByRole`, then `getByLabel` and `getByText`, never with `getByTestId`, a CSS or XPath selector, an element handle or `$eval`.

#### Why

A locator by test id or selector breaks when the markup changes and the user's experience does not, and passes when an element loses the role or the name a user finds it by.

#### Examples

```ts title="Avoid"
await page.locator('#checkout-form button.primary').click();
await page.getByTestId('order-number').waitFor();
```

```ts title="Prefer"
await page.getByRole('button', { name: 'Place order' }).click();
await expect(page.getByRole('heading', { name: /Order \d+ placed/ })).toBeVisible();
```

### waits-only-through-auto-waiting → test-never-sleeps-a-fixed-time · MUST

Every end-to-end spec waits only through locators and web-first assertions. It calls neither `waitForTimeout`, `waitForSelector` nor `waitForNavigation`, and never waits for `networkidle`.

#### Why

A fixed wait, a selector or a quiet network guesses when the page is ready, so the case fails on a slow run and wastes time on a fast one, while locators and web-first assertions retry until it is; Playwright marks `waitForNavigation` deprecated as racy and discourages `waitForSelector` and `networkidle` (playwright.dev).

#### Examples

```ts title="Avoid"
await page.getByRole('button', { name: 'Place order' }).click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
```

```ts title="Prefer"
await page.getByRole('button', { name: 'Place order' }).click();
await expect(page.getByRole('status')).toHaveText('Order placed');
```

### web-first-assertions-awaited → async-work-awaited-or-held-by-a-scope · MUST

Every web-first assertion, an `expect` on a locator or a page, is awaited.

#### Why

A web-first assertion retries until the page agrees; left unawaited, the case ends before it has checked anything.

#### Examples

```ts title="Avoid"
expect(page.getByRole('status')).toHaveText('Order placed');
```

```ts title="Prefer"
await expect(page.getByRole('status')).toHaveText('Order placed');
```

### actions-never-forced → rendered-behaviour-proven-on-the-platform · MUST

No action passes `force: true`.

#### Why

A forced action skips the checks a person's click meets (visible, enabled, not covered) so the spec passes on an element nobody can use.

#### Examples

```ts title="Avoid"
await page.getByRole('button', { name: 'Place order' }).click({ force: true });
```

```ts title="Prefer"
await page.getByRole('button', { name: 'Accept cookies' }).click();
await page.getByRole('button', { name: 'Place order' }).click();
```

## Configuration

### retries-off-in-the-config → flaky-test-fixed-never-retried · SHOULD

Playwright retries no failed case. `playwright.config` sets no retries, the scaffold's `CI ? 2 : 0` removed, so a case that fails once fails the run.

#### Why

A retry turns a flaky case green and hides the race it found.

#### Examples

```ts title="Avoid"
export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,
});
```

```ts title="Prefer"
export default defineConfig({
  testDir: './tests/e2e',
});
```

### trace-kept-on-failure · SHOULD

The trace of every failed case is kept. `playwright.config` keeps it with `trace: 'retain-on-failure'`.

#### Why

Without the trace a failure seen once in CI is reproduced before it can be read, and one that does not recur is never understood; a trace holds each step, the page and the network of the failed run.

#### Examples

```ts title="Avoid"
export default defineConfig({
  testDir: './tests/e2e',
  use: { trace: 'on-first-retry' },
});
```

```ts title="Prefer"
export default defineConfig({
  testDir: './tests/e2e',
  use: { trace: 'retain-on-failure' },
});
```

## Accessibility

### screens-scanned-in-the-browser → rendered-state-scanned-for-accessibility-once · MUST

Each state of a screen the end-to-end specs reach that no narrower spec or story renders is scanned once in the browser. The specs scan it with `@axe-core/playwright` through one shared fixture, on the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`, and each scan passes with no violation.

#### Why

A state no narrower spec or story renders is scanned nowhere else, so without this scan its violations ship, and without `wcag22aa` the target size is never checked.

#### Examples

```ts title="Avoid"
test('should show the receipt when the order is placed', async ({ page }) => {
  // Act
  await page.getByRole('button', { name: 'Place order' }).click();

  // Assert
  await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations.length).toBeLessThan(3);
});
```

```ts title="Prefer"
// tests/e2e/fixtures.ts
export const test = base.extend<{ scanPage: () => Promise<void> }>({
  scanPage: async ({ page }, use) => {
    await use(async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  },
});
```

### layout-rules-scanned-in-the-browser → unscannable-criterion-proven-where-it-renders · MUST

Each screen state a narrower spec renders is scanned in the browser only on the rules a simulated document cannot judge. The end-to-end specs scan each such state they reach once, through the shared fixture, on those rules, such as `color-contrast` and `target-size`.

#### Why

A simulated document measures neither contrast over the real background nor the size of a target, so without a scan in the browser those failures ship unchecked, while a rule a narrower spec already judged proves nothing new when run again.

#### Examples

```ts title="Avoid"
// Assert
await expect(page.getByRole('alert')).toHaveText('This coupon has expired');
```

```ts title="Prefer"
// Assert
await expect(page.getByRole('alert')).toHaveText('This coupon has expired');
await scanLayout(['color-contrast', 'target-size']);
```
