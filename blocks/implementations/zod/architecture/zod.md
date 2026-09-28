# zod

## schema-held-exactly-to-its-model → schema-derives-from-domain-types
A schema over a domain type is held to it exactly — `conformingTo<Model>()(schema)`, or `z.ZodType<Model>` where assignability is enough — and an enum's schema is `z.enum(TheEnum)`.

| Why | Check | Tags |
|---|---|---|
| exact conformance fails both a stricter and a looser schema, so the schema can never say something the domain does not. | tool — types | [] |
