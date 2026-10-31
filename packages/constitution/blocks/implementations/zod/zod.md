---
id: zod
summary: zod parses untrusted input into the program's types.
requires: [typescript]
extends: null
abstract: false
languages: []
governs: ["**/models/**", "**/infrastructure/**"]
---

# zod

> **Zod**, the package **`zod`**, parses untrusted input into the program's types.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `schema-library-rejects-unknown-keys` | `z.strictObject` | yes |
| `schema-library-selects-unions-by-a-discriminant` | `z.discriminatedUnion` | yes |
| `schema-library-generates-the-editors-schema` | `z.toJSONSchema` | yes |
