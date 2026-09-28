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

| Requirement | How in zod | Status |
|---|---|---|
| `schema-rejects-unknown-keys` | `z.strictObject` | met |
| `schema-discriminated-unions` | `z.discriminatedUnion` | met |
| `schema-exports-json-schema` | `z.toJSONSchema` | met |
