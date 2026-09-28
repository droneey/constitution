---
id: zod
summary: zod parses untrusted input into the program's types at the edge.
requires: [typescript]
extends: null
abstract: false
checks: []
dictionary: [zod, Zod]
governs: []
---

# zod

> Parses untrusted input at the edge.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `schema-rejects-unknown-keys` | `z.strictObject` | yes |
| `schema-discriminated-unions` | `z.discriminatedUnion` | yes |
| `schema-exports-json-schema` | `z.toJSONSchema` | yes |
