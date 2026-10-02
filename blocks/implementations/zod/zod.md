---
id: zod
summary: zod parses untrusted input into the program's types.
requires: [typescript]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [zod, Zod]
governs: ["**/models/**", "**/adapters/**"]
---

# zod

> Parses untrusted input into the program's types.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `schema-rejects-unknown-keys` | `z.strictObject` | yes |
| `schema-discriminated-unions` | `z.discriminatedUnion` | yes |
| `schema-exports-json-schema` | `z.toJSONSchema` | yes |
