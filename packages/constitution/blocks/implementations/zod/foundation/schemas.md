# Schemas

> Governs a schema: how it relates to the types — the values it builds and its conformance — and the forms of Zod's API it uses.

## General

### schema-builds-values-through-the-domain → invariant-value-built-only-by-create · MUST

A schema never calls `.brand()` and never restates the check of a value that keeps an invariant: it builds the value through the value's own constructor and turns the value's failure into an issue of its own, since a transform that throws escapes `safeParse`.

| Why |
|---|
| zod's brand is a type of its own, so `.brand()` makes a second definition of the value that skips its check, and a check copied into the schema drifts from the value's own. |

### schema-held-exactly-to-its-model → declared-values-never-typed-again · MUST

A schema over one of the program's types is held to it exactly — `conformingTo<Model>()(schema)`, or `z.ZodType<Model>` where assignability is enough — and an enum's schema is `z.enum(TheEnum)`.

| Why |
|---|
| exact conformance fails both a stricter and a looser schema, so the schema can never say something the type does not. |

### zod-four-forms-only → deprecated-form-never-used · MUST

A schema uses Zod 4's forms — `z.enum`, `z.strictObject` and `z.looseObject`, `A.extend(B.shape)`, a format such as `z.email()` on its own — never `z.nativeEnum`, `.strict()`, `.passthrough()`, `.merge()` or a format chained on `z.string()`.

| Why |
|---|
| Zod 4 deprecates these forms, and replaces `.strict()` with `z.strictObject`. |
