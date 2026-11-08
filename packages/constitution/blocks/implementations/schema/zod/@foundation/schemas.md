# Schemas

> Governs a schema: how it relates to the types, the values it builds, the shapes it parses strictly or tolerantly, and the forms of Zod's API it uses.

## Values

### schema-builds-values-through-their-constructor → parsed-value-built-through-its-own-check · MUST

Every zod schema builds a value through the value's own constructor, never through `.brand()`.

| Why |
|---|
| zod's brand is a type of its own, so `.brand()` makes a second definition of the value that skips its check — a single source of truth. |

### constructor-failure-turned-into-a-zod-issue → check-failure-reported-as-a-parse-problem · MUST

Every failure of a value's constructor inside a zod schema becomes an issue of the parse, never a throw. The transform that calls the constructor adds the failure to its context's issues.

| Why |
|---|
| a transform that throws escapes `safeParse`, which then reports none of the input's issues and hands its caller an exception instead of a result. |

### schema-held-exactly-to-its-type → declared-values-never-typed-again · MUST

Every schema over one of the program's types is held to that type exactly. A type-level test that the schema's output and the type are each assignable to the other holds it, or `z.ZodType<Model>` where one-way assignability is enough, and an enum's schema is `z.enum` over the program's enum itself.

| Why |
|---|
| a schema stricter than its type locks out values the program means, and a looser one lets in values the type rules out; only a test both ways fails on either. |

## Shapes

### strict-objects-for-owned-documents → own-shape-parsed-strictly · MUST

Every shape the program owns is parsed with `z.strictObject`. Exempt: a shape another version of the program also writes, such as a stored record or a message between its instances, which is parsed with `z.looseObject`.

| Why |
|---|
| `z.object` drops an unknown key in silence and `z.looseObject` keeps it, so a shape the program owns parsed by either carries a key nobody declared, while a shape two versions write, parsed strictly, breaks the older one on the first field the newer adds. |

### loose-objects-for-other-partys-shapes → other-partys-shape-parsed-tolerantly · MUST

Every shape another party owns, such as a vendor's response, is parsed with `z.looseObject` or `z.object`, never with `z.strictObject`.

| Why |
|---|
| `z.strictObject` over another party's shape fails on the first field that party adds, though nothing the program reads changed. |

## Forms

### zod-four-forms-only → deprecated-form-never-used · MUST

Every schema uses Zod 4's forms, never the ones Zod 4 deprecates. It writes `z.enum`, `z.strictObject` and `z.looseObject`, `A.extend(B.shape)` and a format such as `z.email()` on its own, never `z.nativeEnum`, `.strict()`, `.passthrough()`, `.merge()` or a format chained on `z.string()`.

| Why |
|---|
| two spellings of one schema double what a reader must know, and a deprecated form may go in a later release; Zod keeps `.strict()` and `.passthrough()` for good, so for those the second spelling is the whole cost (zod.dev/v4/changelog). |
