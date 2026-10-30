# Layout

> Governs role suffixes and surfaces.

## Surfaces

### surface-is-the-folders-index-ts → surface-only-on-a-module-or-one-kind · MUST

A surface is the `index.ts` of its folder, and a folder that has no surface — a layer folder, the source of an application — holds no `index.ts`.

| Why |
|---|
| `index.ts` is the file a folder's import resolves to, so one placed in a layer folder opens a door core keeps shut. |

### surface-imported-by-its-folders-path → module-reached-only-through-its-surface · MUST

An import of a surface ends at its folder — `…/features/orders`, `…/kernel/errors` — never at its `index` or a file below it; code that runs on a runtime that maps no folder to its surface is bundled first.

| Why |
|---|
| the specifier then names the door it goes through, and an import that reaches past the surface shows as a breach in the import itself. |

## Names

### role-suffix-spelled-after-a-dot → file-carries-its-role-suffix · MUST

A role file is `<name>.<role>.ts` — `order.aggregate.ts`, `order-line.entity.ts`, `order.repository.ts` — its role spelled as the vocabulary spells it.

| Why |
|---|
| the dot sets the role apart from a kebab-case name of several words, so the role reads the same way in every folder. |
