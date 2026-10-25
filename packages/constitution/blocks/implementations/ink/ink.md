---
id: ink
summary: Ink renders React to a terminal — boxes, text, keys and frames.
requires: [cli]
extends: _react
abstract: false
languages: []
governs: ["**/*.tsx", "**/*.hooks.ts"]
---

# Ink

> React rendering to a terminal through **Ink**: a tree of boxes and text laid out by flexbox, redrawn as one frame, and read from the keyboard.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `a11y-scanner-runs-inside-a-spec` | no scanner of WCAG rules reads a terminal; a spec renders a control in Ink's screen-reader mode and asserts the role, the state and the label it reads out (`ink-control-spec-reads-the-screen-reader-output`) | partly |
