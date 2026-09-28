# TypeScript

## Modules and files

## hash-imports-leave-the-module · SHOULD
An import that leaves its module uses `#/`; files inside one module import each other by relative path. A module never imports itself through `#/`.
**Why:** the specifier then shows at a glance whether an import crosses a module's border, and a module that imports its own `#/` path starts a cycle through its surface.
**Check:** tool — lint
**Tags:** architecture
**Implements:** `import-only-through-surface`

## typescript-file-forms · MUST
Source files are kebab-case `.ts`, and `.tsx` only where markup is written. A role file is `<name>.<role>.ts`, a surface `index.ts`. In `__tests__/`, a spec is `<file name>.test.ts`, `<name>.integration.test.ts` or `<name>.e2e.test.ts`, a fake `<port>.fake.ts`, fixtures `<name>.fixtures.ts`.
**Why:** one spelling of every role lets the tools and the reader find a file by its name.
**Check:** tool — names
**Tags:** naming
**Implements:** `kebab-case-file-names`

## Values and types

## undefined-is-the-only-absence · MUST
Internal code spells absence as `undefined`: `?: T` for what may be absent, `T | undefined` only where an explicit `undefined` means something, `return;` for no result. `null` lives only in wire types and adapters, which map it to `undefined`, and in a comparison with what a platform API returns. The compiler runs with `exactOptionalPropertyTypes`.
**Why:** one spelling of absence means one check, and the compiler option stops an absent field from being set to `undefined` by accident.
**Check:** tool — lint
**Tags:** types, data
**Implements:** `absence-has-one-value-normalised-at-boundary`

## boundary-values-unknown-until-parsed · MUST
A value from beyond the boundary — `JSON.parse`, a response body, a file, a message — is `unknown` until a schema parses it. `.json<T>()` and `as Promise<T>` are casts.
**Why:** a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away.
**Check:** tool — lint
**Tags:** types, security
**Implements:** `untrusted-input-parsed-at-edge`

## brands-set-at-the-boundary · SHOULD
An identifier's brand is `string & { readonly __brand: 'OrderId' }` or a unique symbol, set only in the mapper at the boundary. Aliases of the vocabulary stay plain names.
**Why:** a brand set in one place is a proof that the value came through it; set anywhere, it proves nothing.
**Check:** tool — types
**Tags:** types
**Implements:** `identifiers-branded-by-entity`

## ambient-aliases-are-project-vocabulary · SHOULD
A project may declare semantic aliases — `type Email = string` — in one ambient `types.d.ts` at its source root: only aliases it uses, each for a meaning found in two or more places, never for a string that is just a string. Code in `libs/` never references them.
**Why:** an alias names a meaning the program shares; one per string, or one `libs/` depends on, turns vocabulary into noise or a hidden dependency.
**Check:** review
**Tags:** types, naming
