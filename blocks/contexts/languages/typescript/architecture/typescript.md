# TypeScript

> A folder's surface is `index.ts`, a role file is `<name>.<role>.ts`, and the wiring file is `root/wiring.ts`, unless a framework's block names its own.

## Modules and files

### hash-imports-leave-the-module → module-files-import-each-other-directly
An import that leaves its module uses `#/`; files inside one module import each other by relative path. A module never imports itself through `#/`.

| Why | Tags |
|---|---|
| the specifier then shows at a glance whether an import crosses a module's border, and a module that imports its own `#/` path starts a cycle through its surface. | [] |

### typescript-role-and-surface-files → file-carries-its-role-suffix
A role file is `<name>.<role>.ts`, and a folder's surface is `index.ts`.

| Why | Tags |
|---|---|
| one spelling of every role and of the surface lets the tools and the reader find a file by its name. | [] |

## Values and types

### null-mapped-to-undefined-at-boundary → outside-shape-mapped-in-the-adapter
`null` lives only in wire types and in the adapters that read them, which map it to `undefined` at the boundary.

| Why | Tags |
|---|---|
| a `null` that travels inward brings a second absence into code that checks only for `undefined`. | [] |

### domain-type-fields-readonly · SHOULD
A field of an interface or an object type declared in a `*.entity.ts` or `*.value-object.ts` file is `readonly`.

| Why | Tags |
|---|---|
| the role suffix marks the business data, so the lint holds its fields; lists and maps stay with review. | [] |

### brands-set-at-the-boundary → identifier-branded-by-entity
An identifier's brand is set only in the mapper at the boundary.

| Why | Tags |
|---|---|
| a brand set in one place is a proof that the value came through it; set anywhere, it proves nothing. | [] |

### semantic-alias-exported-where-it-belongs · SHOULD
A semantic alias is a type exported by the module whose meaning it names, and a vocabulary several features share lives in `kernel/`. A term that keeps an invariant is a value object, never an alias.

| Why | Tags |
|---|---|
| an alias imported from its module shows in every file where its meaning comes from, and the import rules hold it like any other type; an ambient alias reaches every file unseen, `libs/` included, and no rule can keep it out. | [] |

