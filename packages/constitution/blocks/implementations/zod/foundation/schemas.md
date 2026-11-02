# Schemas

> Governs a schema: how it relates to the types — the values it builds and its conformance — and the forms of Zod's API it uses.

## General

### schema-builds-values-through-their-constructor → parsed-value-built-through-its-own-check · MUST

A zod schema builds a value through the value's own constructor, never through `.brand()`. It turns the constructor's failure into an issue of its own, since a transform that throws escapes `safeParse`.

| Why |
|---|
| zod's brand is a type of its own, so `.brand()` makes a second definition of the value that skips its check, and a transform that throws escapes `safeParse`, which then reports none of the input's issues — a single source of truth. |

### schema-held-exactly-to-its-type → declared-values-never-typed-again · MUST

A schema over one of the program's types is held to that type exactly. A check that fails both a stricter and a looser schema holds it, or `z.ZodType<Model>` where assignability is enough, and an enum's schema is `z.enum` over the program's enum itself.

| Why |
|---|
| a schema stricter than its type locks out values the program means, and a looser one lets in values the type rules out; only an exact check fails both. |

### strict-objects-for-owned-documents → own-shape-strict-other-shape-tolerant · MUST

A document the program owns is parsed with `z.strictObject`. A vendor's response is parsed with `z.looseObject` or `z.object`.

| Why |
|---|
| `z.object` drops an unknown key in silence and `z.looseObject` keeps it, so a document the program owns parsed by either carries a key nobody declared, while `z.strictObject` over a vendor's response fails on the first field the vendor adds. |

### zod-four-forms-only → deprecated-form-never-used · MUST

A schema uses Zod 4's forms, never the ones Zod 4 deprecates. It writes `z.enum`, `z.strictObject` and `z.looseObject`, `A.extend(B.shape)` and a format such as `z.email()` on its own, never `z.nativeEnum`, `.strict()`, `.passthrough()`, `.merge()` or a format chained on `z.string()`.

| Why |
|---|
| Zod 4 deprecates these forms in favour of the ones named, `.strict()` for `z.strictObject` among them, so a schema written in them breaks when a later release removes them, and two spellings of one schema double what a reader must know. |
