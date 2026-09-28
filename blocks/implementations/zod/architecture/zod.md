# zod

## schema-held-exactly-to-its-model · MUST
A schema over a domain type is held to it exactly — `conformingTo<Model>()(schema)`, or `z.ZodType<Model>` where assignability is enough — and an enum's schema is `z.enum(TheEnum)`.
**Why:** exact conformance fails both a stricter and a looser schema, so the schema can never say something the domain does not.
**Check:** tool — types
**Tags:** types
**Implements:** `schema-derives-from-domain-types`
