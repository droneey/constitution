# zod

## strict-objects-for-owned-documents · MUST
A document the program owns is parsed with `z.strictObject`; a vendor's response with `z.object`, so a new field from the vendor is ignored, not fatal.
**Why:** the program's own document must not carry unknown keys, while a vendor may add fields at any time.
**Check:** test
**Tags:** data
**Implements:** `document-schema-strict`

## json-schema-from-zod · MUST
The published JSON Schema is built by `z.toJSONSchema` from the document's schema.
**Why:** the schema editors read then comes from the code, and cannot drift from it.
**Check:** test
**Tags:** data
**Implements:** `published-schema-generated-from-code`

## zod-issues-become-error-details · SHOULD
Input is parsed with `safeParse`, and each issue becomes a detail of one coded error, with its path.
**Why:** the user sees every problem of the input at once, each pointing at its place.
**Check:** test
**Tags:** errors
**Implements:** `expected-failures-typed-with-codes`
