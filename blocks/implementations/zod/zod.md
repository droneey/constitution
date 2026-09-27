---
id: zod
kind: implementation
summary: zod parses untrusted input into the program's types at the edge.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: []
owns: [zod, Zod]
governs: []
status: stable
---

# zod

> Parses untrusted input at the edge.

## zod-only-at-the-edge · MUST
zod is imported only at the edge — adapters and their `models/`, the delivery layer's flags, the root's configuration, the document in `composition/` — never under `domain/`.
**Why:** a schema library in the domain ties the business rules to a vendor, and the domain declares types, not parsers.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `domain-imports-only-itself-and-kernel`

## schema-held-exactly-to-its-model · MUST
A schema over a domain type is held to it exactly — `conformingTo<Model>()(schema)`, or `z.ZodType<Model>` where assignability is enough — and an enum's schema is `z.enum(TheEnum)`.
**Why:** exact conformance fails both a stricter and a looser schema, so the schema can never say something the domain does not.
**Check:** tool — types
**Tags:** types
**Implements:** `schema-derives-from-domain-types`

## strict-objects-for-owned-documents · SHOULD
A document the program owns is parsed with `z.strictObject`; a vendor's response with `z.object`, so a new field from the vendor is ignored, not fatal.
**Why:** the program's own document must not carry unknown keys, while a vendor may add fields at any time.
**Check:** test
**Tags:** data
**Implements:** `document-schema-strict`

## zod-issues-become-error-details · SHOULD
`safeParse` runs at the edge, and each issue becomes a detail of one coded error, with its path.
**Why:** the user sees every problem of the input at once, each pointing at its place.
**Check:** test
**Tags:** errors
**Implements:** `expected-failures-typed-with-codes`

## json-schema-from-zod · SHOULD
The published JSON Schema is built by `z.toJSONSchema` from the document's schema.
**Why:** the schema editors read then comes from the code, and cannot drift from it.
**Check:** test
**Tags:** data
**Implements:** `published-schema-generated-from-code`

## Requirements

| Requirement | How in zod | Status |
|---|---|---|
| `schema-rejects-unknown-keys` | `z.strictObject` | met |
| `schema-discriminated-unions` | `z.discriminatedUnion` | met |
| `schema-exports-json-schema` | `z.toJSONSchema` | met |
