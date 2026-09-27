---
id: yaml
kind: implementation
summary: The yaml package reads and writes YAML at the edge.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# yaml

> Reads and writes YAML. It owns no word: the package is named after the format, and the format belongs to no block.

## yaml-only-at-the-edge · MUST
The `yaml` package is imported only by the adapter or the `libs/` wrapper that parses, and its result is `unknown` until a schema parses it.
**Why:** a parser in the domain ties the business rules to a file format, and its untyped result must not travel inward.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `domain-imports-only-itself-and-kernel`

## yaml-failures-become-one-coded-error · SHOULD
Every failure of `parse` — a syntax error, and an alias without its anchor, which throws a `ReferenceError` — becomes one coded error with its cause.
**Why:** the caller then handles one error type, and the user sees where the document is wrong.
**Check:** test
**Tags:** errors
**Implements:** `expected-failures-typed-with-codes`

## yaml-written-without-folding · SHOULD
YAML is written with `lineWidth: 0`, so no value is folded across lines.
**Why:** a folded value moves in a diff whenever a neighbour changes.
**Check:** test
**Tags:** data
