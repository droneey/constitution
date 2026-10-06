---
id: playwright
summary: Drives the built program in real browsers for end-to-end specs.
requires: [browser, ui, typescript]
extends: null
abstract: false
languages: []
dictionary: [Playwright]
governs: ["tests/e2e/**", "playwright.config.*"]
---

# Playwright

> Runs the end-to-end specs, `tests/e2e/<name>.e2e.test`, against the built program in real browsers, the way its users reach it. `playwright.config` sets `testDir: 'tests/e2e'`, matches only the end-to-end specs, and starts the built program through `webServer`. Its part of the constitution's release archive turns on the lint rules for the specs.

### locators-by-role-label-text → elements-found-by-role-label-text
A spec finds elements with `getByRole`, then `getByLabel` and `getByText`; never with `getByTestId`, a CSS or XPath selector, or an element handle.

| Why | Tags |
|---|---|
| a locator that finds elements as a user does breaks only when the user's experience does. | [a11y] |

### waits-through-locators-and-assertions → no-fixed-sleeps-in-tests
A spec calls neither `waitForTimeout`, `waitForSelector` nor `waitForNavigation`, and never waits for `networkidle`; it waits through locators and web-first assertions.

| Why | Tags |
|---|---|
| locators and web-first assertions retry until the page is ready, while a fixed wait, a selector or a quiet network guesses when it is. | [] |

### web-first-assertions-awaited → async-work-awaited-or-deliberately-detached
Every web-first assertion — an `expect` on a locator or a page — is awaited.

| Why | Tags |
|---|---|
| a web-first assertion retries until the page agrees; left unawaited, the case ends before it has checked anything. | [] |

### no-forced-actions → layout-and-focus-proven-on-the-platform
No action passes `force: true`.

| Why | Tags |
|---|---|
| a forced action skips the checks a person's click meets — visible, enabled, not covered — so the spec passes on an element nobody can use. | [a11y] |

### retries-off-in-the-config → flaky-test-fixed-or-removed
`playwright.config` sets no retries — the scaffold's `CI ? 2 : 0` goes — so a case that fails once fails the run.

| Why | Tags |
|---|---|
| a retry turns a flaky case green and hides the race it found. | [] |

### trace-kept-on-failure · SHOULD
`playwright.config` keeps the trace of every failed case, with `trace: 'retain-on-failure'`.

| Why | Tags |
|---|---|
| a trace holds each step, the page and the network of the failed run, so the failure is read without running it again. | [testing] |

## Accessibility

### screens-scanned-in-the-browser → ui-specs-scan-accessibility
Every end-to-end spec scans each screen it reaches with `@axe-core/playwright`, through one shared fixture, on the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`, and passes with zero violations.

| Why | Tags |
|---|---|
| only a real browser measures contrast over the real background and the size of a target; without `wcag22aa` the target size is never checked. | [a11y] |
