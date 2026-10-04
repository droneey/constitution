# zod

## strict-objects-for-owned-documents → document-schema-strict
A document the program owns is parsed with `z.strictObject`; a vendor's response with `z.object`, so a new field from the vendor is ignored, not fatal.

| Why | Check | Tags |
|---|---|---|
| the program's own document must not carry unknown keys, while a vendor may add fields at any time. | test | [] |

## json-schema-from-zod → published-schema-generated-from-code
The published JSON Schema is built by `z.toJSONSchema` from the document's schema.

| Why | Check | Tags |
|---|---|---|
| the schema editors read then comes from the code, and cannot drift from it. | test | [] |

## zod-issues-become-error-details → expected-failures-typed-with-codes
Input is parsed with `safeParse`, and each issue becomes a detail of one coded error, with its path.

| Why | Check | Tags |
|---|---|---|
| the user sees every problem of the input at once, each pointing at its place. | test | [] |

## zod-four-forms-only · MUST
A schema uses Zod 4's forms — `z.enum`, `z.strictObject` and `z.looseObject`, `A.extend(B.shape)`, a format such as `z.email()` on its own — never `z.nativeEnum`, `.strict()`, `.passthrough()`, `.merge()` or a format chained on `z.string()`.

| Why | Check | Tags |
|---|---|---|
| Zod 4 deprecates these forms and replaces `.strict()` with `z.strictObject`, and two spellings of one schema double what a reader must know. | tool/lint | [] |
