# TypeScript

## Modules and files

## hash-imports-leave-the-module · MUST
An import that leaves its module uses `#/`; files inside one module import each other by relative path. A module never imports itself through `#/`.
**Why:** the specifier then shows at a glance whether an import crosses a module's border, and a module that imports its own `#/` path starts a cycle through its surface.
**Check:** tool — lint
**Implements:** `import-only-through-surface`

## typescript-role-and-surface-files · MUST
A role file is `<name>.<role>.ts`, and a folder's surface is `index.ts`.
**Why:** one spelling of every role and of the surface lets the tools and the reader find a file by its name.
**Check:** tool — names
**Tags:** naming
**Implements:** `file-carries-its-role-suffix`

## Values and types

## null-mapped-to-undefined-at-boundary · MUST
`null` lives only in wire types and in the adapters that read them, which map it to `undefined` at the boundary.
**Why:** a `null` that travels inward brings a second absence into code that checks only for `undefined`.
**Check:** review
**Tags:** types, data
**Implements:** `wire-absence-mapped-at-boundary`

## boundary-values-unknown-until-parsed · MUST
A value from beyond the boundary — `JSON.parse`, a response body, a file, a message — is `unknown` until a schema parses it. `.json<T>()` and `as Promise<T>` are casts.
**Why:** a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away.
**Check:** tool — lint
**Tags:** types, security
**Implements:** `untrusted-input-parsed-at-edge`

## brands-set-at-the-boundary · SHOULD
An identifier's brand is set only in the mapper at the boundary.
**Why:** a brand set in one place is a proof that the value came through it; set anywhere, it proves nothing.
**Check:** review
**Tags:** types
**Implements:** `identifiers-branded-by-entity`

## ambient-aliases-are-project-vocabulary · SHOULD
A project's semantic aliases live in one ambient `types.d.ts` at its source root, and code in `libs/` never references them.
**Why:** one file holds the program's vocabulary, and `libs/` stays free of a hidden dependency on it.
**Check:** review
**Tags:** types, naming
**Implements:** `semantic-alias-names-a-shared-meaning`
