# yaml

## yaml-only-at-the-edge · MUST
The `yaml` package is imported only by the adapter or the `libs/` wrapper that parses, and its result is `unknown` until a schema parses it.
**Why:** a parser in the domain ties the business rules to a file format, and its untyped result must not travel inward.
**Check:** tool — architecture
**Implements:** `domain-imports-only-itself-and-kernel`
