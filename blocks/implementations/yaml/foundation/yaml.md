# yaml

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
