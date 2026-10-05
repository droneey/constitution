# zod

## strict-objects-for-owned-documents → documents-strict-vendor-answers-tolerant
A document the program owns is parsed with `z.strictObject`; a vendor's response with `z.object`.

| Why | Check | Tags |
|---|---|---|
| `z.strictObject` fails on an unknown key, and `z.object` drops it. | test | [] |

## zod-issues-become-error-details → parse-failure-is-one-coded-error
Input is parsed with `safeParse`, and each of the error's `issues` becomes a detail, with its `path`.

| Why | Check | Tags |
|---|---|---|
| `safeParse` returns every issue as a value, and each carries the path to its place. | test | [] |

## zod-four-forms-only → deprecated-forms-never-used
A schema uses Zod 4's forms — `z.enum`, `z.strictObject` and `z.looseObject`, `A.extend(B.shape)`, a format such as `z.email()` on its own — never `z.nativeEnum`, `.strict()`, `.passthrough()`, `.merge()` or a format chained on `z.string()`.

| Why | Check | Tags |
|---|---|---|
| Zod 4 deprecates these forms, and replaces `.strict()` with `z.strictObject`. | tool/lint | [] |
