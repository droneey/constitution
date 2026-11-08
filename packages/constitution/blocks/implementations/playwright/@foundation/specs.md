# Specs

> Governs the end-to-end specs: their locators, waits, actions, retries, traces and accessibility scan.

## Cases

### locators-never-by-test-id-selector-or-handle → element-found-by-role-label-or-text · MUST

Every end-to-end spec finds elements as a user does. It finds them with `getByRole`, then `getByLabel` and `getByText`, never with `getByTestId`, a CSS or XPath selector, an element handle or `$eval`.

| Why |
|---|
| a locator by test id or selector breaks when the markup changes and the user's experience does not, and passes when an element loses the role or the name a user finds it by. |

### waits-only-through-auto-waiting → test-never-sleeps-a-fixed-time · MUST

Every end-to-end spec waits only through locators and web-first assertions. It calls neither `waitForTimeout`, `waitForSelector` nor `waitForNavigation`, and never waits for `networkidle`.

| Why |
|---|
| a fixed wait, a selector or a quiet network guesses when the page is ready, so the case fails on a slow run and wastes time on a fast one, while locators and web-first assertions retry until it is; Playwright marks `waitForNavigation` deprecated as racy and discourages `waitForSelector` and `networkidle` (playwright.dev). |

### web-first-assertions-awaited → async-work-awaited-or-held-by-a-scope · MUST

Every web-first assertion, an `expect` on a locator or a page, is awaited.

| Why |
|---|
| a web-first assertion retries until the page agrees; left unawaited, the case ends before it has checked anything. |

### actions-never-forced → rendered-behaviour-proven-on-the-platform · MUST

No action passes `force: true`.

| Why |
|---|
| a forced action skips the checks a person's click meets (visible, enabled, not covered) so the spec passes on an element nobody can use. |

## Configuration

### retries-off-in-the-config → flaky-test-fixed-never-retried · SHOULD

Playwright retries no failed case. `playwright.config` sets no retries, the scaffold's `CI ? 2 : 0` removed, so a case that fails once fails the run.

| Why |
|---|
| a retry turns a flaky case green and hides the race it found. |

### trace-kept-on-failure · SHOULD

The trace of every failed case is kept. `playwright.config` keeps it with `trace: 'retain-on-failure'`.

| Why |
|---|
| without the trace a failure seen once in CI is reproduced before it can be read, and one that does not recur is never understood; a trace holds each step, the page and the network of the failed run. |

## Accessibility

### screens-scanned-in-the-browser → rendered-state-scanned-for-accessibility-once · MUST

Each state of a screen the end-to-end specs reach that no narrower spec or story renders is scanned once in the browser. The specs scan it with `@axe-core/playwright` through one shared fixture, on the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`, and each scan passes with no violation.

| Why |
|---|
| a state no narrower spec or story renders is scanned nowhere else, so without this scan its violations ship, and without `wcag22aa` the target size is never checked. |

### layout-rules-scanned-in-the-browser → unscannable-criterion-proven-where-it-renders · MUST

Each screen state a narrower spec renders is scanned in the browser only on the rules a simulated document cannot judge. The end-to-end specs scan each such state they reach once, through the shared fixture, on those rules, such as `color-contrast` and `target-size`.

| Why |
|---|
| a simulated document measures neither contrast over the real background nor the size of a target, so without a scan in the browser those failures ship unchecked, while a rule a narrower spec already judged proves nothing new when run again. |
