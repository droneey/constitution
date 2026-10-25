---
id: playwright
summary: Drives the built program in real browsers for end-to-end specs.
requires: [browser, ui, typescript]
extends: null
abstract: false
languages: []
governs: ["tests/e2e/**", "playwright.config.*"]
---

# Playwright

> **Playwright** runs the end-to-end specs, `tests/e2e/<name>.e2e.test`, against the built program in real browsers, the way its users reach it.

`playwright.config` sets `testDir: 'tests/e2e'`, matches only the end-to-end specs, and starts the built program through `webServer`. Its part of the Constitution's release archive turns on the lint rules for the specs.
