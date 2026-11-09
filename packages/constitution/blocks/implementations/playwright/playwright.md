---
id: playwright
summary: Drives the built program in real browsers for end-to-end specs.
requires: [client/browser, presentation]
languages: []
governs: ["tests/e2e/**", "playwright.config.*"]
---

# Playwright

> Playwright runs the end-to-end specs against the built program in real browsers, the way its users reach it.

`playwright.config` points `testDir` at the end-to-end suite, matches only the end-to-end spec files and starts the built program through `webServer`. Its preset entries turn on the lint rules for the specs.
