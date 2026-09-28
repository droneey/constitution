# zod

## schema-held-exactly-to-its-model · MUST
A schema over a domain type is held to it exactly — `conformingTo<Model>()(schema)`, or `z.ZodType<Model>` where assignability is enough — and an enum's schema is `z.enum(TheEnum)`.
**Why:** exact conformance fails both a stricter and a looser schema, so the schema can never say something the domain does not.
**Check:** tool — types
**Tags:** types
**Implements:** `schema-derives-from-domain-types`

## zod-issues-become-error-details · SHOULD
`safeParse` runs at the edge, and each issue becomes a detail of one coded error, with its path.
**Why:** the user sees every problem of the input at once, each pointing at its place.
**Check:** test
**Tags:** errors
**Implements:** `expected-failures-typed-with-codes`
