# Schemas

> Governs a schema: how it relates to the types — brands, strictness and conformance — and the forms of Zod's API it uses.

## General

### schema-never-brands → invariant-value-is-a-branded-type · MUST

A schema never calls `.brand()`; it produces a branded value through the value's own `<Name>.create`, after the schema has checked the invariant, as in `z.string().refine(Email.is).transform(Email.create)`, since a transform that throws escapes `safeParse`.

| Why | Tags |
|---|---|
| zod's brand is a type of its own, so `.brand()` makes a second definition of the value that skips its check. | [] |

### strict-objects-for-owned-documents → own-shape-strict-other-shape-tolerant · MUST

A document the program owns is parsed with `z.strictObject`; a vendor's response with `z.object`.

| Why | Tags |
|---|---|
| `z.strictObject` fails on an unknown key, and `z.object` drops it. | [] |

### schema-held-exactly-to-its-model → declared-values-never-typed-again · MUST

A schema over one of the program's types is held to it exactly — `conformingTo<Model>()(schema)`, or `z.ZodType<Model>` where assignability is enough — and an enum's schema is `z.enum(TheEnum)`.

| Why | Tags |
|---|---|
| exact conformance fails both a stricter and a looser schema, so the schema can never say something the type does not. | [] |

### zod-four-forms-only → deprecated-form-never-used · MUST

A schema uses Zod 4's forms — `z.enum`, `z.strictObject` and `z.looseObject`, `A.extend(B.shape)`, a format such as `z.email()` on its own — never `z.nativeEnum`, `.strict()`, `.passthrough()`, `.merge()` or a format chained on `z.string()`.

| Why | Tags |
|---|---|
| Zod 4 deprecates these forms, and replaces `.strict()` with `z.strictObject`. | [] |
