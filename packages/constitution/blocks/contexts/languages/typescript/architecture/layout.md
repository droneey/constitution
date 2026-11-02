# Layout

> Governs a package's tree in TypeScript: its surfaces, how they are imported, and its role suffixes.

## Surfaces

### surface-is-the-folders-index-ts → surface-only-on-a-module-or-one-kind · MUST

A surface is the `index.ts` of its folder. A folder that has no surface — a layer folder other than `root/`, the source of a program no package imports — holds no `index.ts`.

| Why |
|---|
| `index.ts` is the file a folder's import resolves to, so one placed in a layer folder opens a door core keeps shut. |

### surface-imported-by-its-folders-path → module-reached-only-through-its-surface · MUST

An import of a surface ends at its folder. It names the folder — `…/features/<feature>`, `…/kernel/errors` — never its `index` or a file below it; code that runs on a runtime that maps no folder to its surface is bundled first.

| Why |
|---|
| an import that ends at `index` or at a file below it hides whether it went through the door, so a breach of the surface reads like any other import. |

## Names

### role-suffix-spelled-after-a-dot → file-carries-its-role-suffix · MUST

A role file is `<name>.<role>.ts`. Its role is spelled after a dot, as the vocabulary spells it.

| Why |
|---|
| a role joined to a kebab-case name by a hyphen reads as one more word of that name, so neither a reader nor a tool can tell the role apart from it. |
