# zod

## schema-held-exactly-to-its-model → schema-derives-from-domain-types
A schema over a domain type is held to it exactly — `conformingTo<Model>()(schema)`, or `z.ZodType<Model>` where assignability is enough — and an enum's schema is `z.enum(TheEnum)`.

| Why | Check | Tags |
|---|---|---|
| exact conformance fails both a stricter and a looser schema, so the schema can never say something the domain does not. | review | [] |

## schema-never-brands → boundary-builds-value-objects-through-the-domain
A schema never calls `.brand()`; it produces a value object through the domain's `create…`, as in `z.string().transform(createEmail)`.

| Why | Check | Tags |
|---|---|---|
| zod's brand is a type of its own, so `.brand()` makes a second definition of the value object that skips its check. | tool/lint | [] |
