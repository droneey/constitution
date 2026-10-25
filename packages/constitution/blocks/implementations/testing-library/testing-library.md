---
id: testing-library
summary: Testing Library — specs that use the UI the way a person does.
requires: [_react]
extends: null
abstract: false
languages: []
governs: ["**/__tests__/**/*.test.tsx"]
---

# Testing Library

> **Testing Library**: specs that render the user interface and use it as a person does, through **`userEvent`**.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `a11y-scanner-runs-inside-a-spec` | over a document, axe runs on the rendered container through a matcher registered in the test setup and reports each violation with its element (`ui-specs-run-the-axe-scan`); a native renderer leaves no document for it to scan | partly |
