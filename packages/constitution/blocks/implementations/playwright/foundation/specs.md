# Specs

> Governs the end-to-end specs: their locators, waits, actions, retries, traces and accessibility scan.

## Cases

### locators-by-role-label-text → element-found-by-role-label-or-text · MUST

A spec finds elements with `getByRole`, then `getByLabel` and `getByText`; never with `getByTestId`, a CSS or XPath selector, or an element handle.

| Why |
|---|
| a locator that finds elements as a user does breaks only when the user's experience does. |

### waits-through-locators-and-assertions → test-never-sleeps-a-fixed-time · SHOULD

A spec calls neither `waitForTimeout`, `waitForSelector` nor `waitForNavigation`, and never waits for `networkidle`; it waits through locators and web-first assertions.

| Why |
|---|
| locators and web-first assertions retry until the page is ready, while a fixed wait, a selector or a quiet network guesses when it is. |

### web-first-assertions-awaited → async-work-awaited-or-held-by-a-scope · MUST

Every web-first assertion — an `expect` on a locator or a page — is awaited.

| Why |
|---|
| a web-first assertion retries until the page agrees; left unawaited, the case ends before it has checked anything. |

### actions-never-forced → layout-and-focus-proven-on-the-platform · SHOULD

No action passes `force: true`.

| Why |
|---|
| a forced action skips the checks a person's click meets — visible, enabled, not covered — so the spec passes on an element nobody can use. |

## Configuration

### retries-off-in-the-config → flaky-test-fixed-never-retried · SHOULD

`playwright.config` sets no retries — the scaffold's `CI ? 2 : 0` goes — so a case that fails once fails the run.

| Why |
|---|
| a retry turns a flaky case green and hides the race it found. |

### trace-kept-on-failure · SHOULD

`playwright.config` keeps the trace of every failed case, with `trace: 'retain-on-failure'`.

| Why |
|---|
| a trace holds each step, the page and the network of the failed run, so the failure is read without running it again. |

## Accessibility

### screens-scanned-in-the-browser → ui-specs-scan-accessibility · MUST

Every end-to-end spec scans each screen it reaches with `@axe-core/playwright`, through one shared fixture, on the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`, and passes with zero violations.

| Why |
|---|
| only a real browser measures contrast over the real background and the size of a target; without `wcag22aa` the target size is never checked. |
