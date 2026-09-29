---
id: testing-library
summary: Testing Library — specs that use the UI the way a person does.
requires: [_react]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [Testing Library, userEvent]
governs: ["**/__tests__/**/*.test.tsx"]
---

# Testing Library

> Specs that render the user interface and use it as a person does.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `a11y-scan-inside-component-specs` | axe runs over the rendered container through a matcher registered in the test setup, reporting each violation with its element | yes |
