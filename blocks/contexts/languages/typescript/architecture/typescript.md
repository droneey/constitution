# TypeScript

> A folder's surface is `index.ts`, a role file is `<name>.<role>.ts`, and the wiring file is `root/wiring.ts`.

## Modules and files

## hash-imports-leave-the-module → import-only-through-surface
An import that leaves its module uses `#/`; files inside one module import each other by relative path. A module never imports itself through `#/`.

| Why | Check | Tags |
|---|---|---|
| the specifier then shows at a glance whether an import crosses a module's border, and a module that imports its own `#/` path starts a cycle through its surface. | review | [] |

## typescript-role-and-surface-files → file-carries-its-role-suffix
A role file is `<name>.<role>.ts`, and a folder's surface is `index.ts`.

| Why | Check | Tags |
|---|---|---|
| one spelling of every role and of the surface lets the tools and the reader find a file by its name. | tool/names | [] |

## Values and types

## null-mapped-to-undefined-at-boundary → wire-absence-mapped-at-boundary
`null` lives only in wire types and in the adapters that read them, which map it to `undefined` at the boundary.

| Why | Check | Tags |
|---|---|---|
| a `null` that travels inward brings a second absence into code that checks only for `undefined`. | review | [] |

## boundary-values-unknown-until-parsed → untrusted-input-parsed-at-edge
A value from beyond the boundary — `JSON.parse`, a response body, a file, a message — is `unknown` until the project's schema parses it or plain checks — `typeof`, `in`, `Array.isArray` — narrow it, in specs as in production. `.json<T>()` and `as Promise<T>` are casts.

| Why | Check | Tags |
|---|---|---|
| a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away. | review | [] |

## brands-set-at-the-boundary → identifiers-branded-by-entity
An identifier's brand is set only in the mapper at the boundary.

| Why | Check | Tags |
|---|---|---|
| a brand set in one place is a proof that the value came through it; set anywhere, it proves nothing. | review | [] |

## ambient-aliases-are-project-vocabulary → semantic-alias-names-a-shared-meaning
A project's semantic aliases live in one ambient `types.d.ts` at its source root, and code in `libs/` never references them.

| Why | Check | Tags |
|---|---|---|
| one file holds the program's vocabulary, and `libs/` stays free of a hidden dependency on it. | review | [] |
