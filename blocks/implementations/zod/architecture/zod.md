# zod

## schema-never-brands → value-object-built-only-by-its-check
A schema never calls `.brand()`; it produces a value object through the domain's `create…`, as in `z.string().transform(createEmail)`.

| Why | Check | Tags |
|---|---|---|
| zod's brand is a type of its own, so `.brand()` makes a second definition of the value object that skips its check. | tool/lint | [] |
