# Playwright

## locators-by-role-label-text → elements-found-by-role-label-text
A spec finds elements with `getByRole`, then `getByLabel` and `getByText`; never with `getByTestId`, a CSS or XPath selector, or an element handle.

| Why | Check | Tags |
|---|---|---|
| a locator that finds elements as a user does breaks only when the user's experience does. | review | [a11y] |

## waits-through-locators-and-assertions → no-fixed-sleeps-in-tests
A spec calls neither `waitForTimeout`, `waitForSelector` nor `waitForNavigation`, and never waits for `networkidle`; it waits through locators and web-first assertions.

| Why | Check | Tags |
|---|---|---|
| locators and web-first assertions retry until the page is ready, while a fixed wait, a selector or a quiet network guesses when it is. | tool/lint | [] |

## web-first-assertions-awaited → async-work-awaited-or-deliberately-detached
Every web-first assertion — an `expect` on a locator or a page — is awaited.

| Why | Check | Tags |
|---|---|---|
| a web-first assertion retries until the page agrees; left unawaited, the case ends before it has checked anything. | tool/lint | [] |

## no-forced-actions → layout-and-focus-proven-on-the-platform
No action passes `force: true`.

| Why | Check | Tags |
|---|---|---|
| a forced action skips the checks a person's click meets — visible, enabled, not covered — so the spec passes on an element nobody can use. | tool/lint | [a11y] |

## retries-off-in-the-config → flaky-test-fixed-or-removed
`playwright.config` sets no retries — the scaffold's `CI ? 2 : 0` goes — so a case that fails once fails the run.

| Why | Check | Tags |
|---|---|---|
| a retry turns a flaky case green and hides the race it found. | review | [] |

## trace-kept-on-failure · SHOULD
`playwright.config` keeps the trace of every failed case, with `trace: 'retain-on-failure'`.

| Why | Check | Tags |
|---|---|---|
| a trace holds each step, the page and the network of the failed run, so the failure is read without running it again. | review | [testing] |
