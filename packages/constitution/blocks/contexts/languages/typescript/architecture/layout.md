# Layout

> Governs hash imports, role suffixes, surfaces and further entries.

## Surfaces

### hash-imports-leave-the-module → module-files-import-each-other-directly · MUST

An import that leaves its module is written from `#/`, and an import inside its module by a relative path.

| Why | Tags |
|---|---|
| the specifier then shows at a glance whether an import crosses a module's border. | [] |

### surface-is-the-folders-index-ts → surface-only-on-a-module-or-one-kind · MUST

A surface is the `index.ts` of its folder, and a folder that has no surface — a layer folder, the source of an application — holds no `index.ts`.

| Why | Tags |
|---|---|
| `index.ts` is the file a folder's import resolves to, so one placed in a layer folder opens a door core keeps shut. | [] |

### further-entry-is-a-subpath-named-after-what-it-offers → further-entry-sits-beside-the-surface · SHOULD

A further entry is an `exports` subpath named after what it offers, `./testing`, mapped to its file beside `src/index.ts`.

| Why | Tags |
|---|---|
| the specifier `@<scope>/<name>/testing` then names the door, and its file is found beside the surface it stands next to. | [] |

### surface-imported-by-its-folders-path → module-reached-only-through-its-surface · MUST

An import of a surface names its folder — `#/features/orders`, `#/kernel/errors` — never its `index` or a file below it; code that runs on a runtime that maps no folder to its surface, or resolves no `#/` specifier, is bundled first.

| Why | Tags |
|---|---|
| the specifier then names the door it goes through, and an import that reaches past the surface shows as a breach in the import itself. | [] |

## Names

### role-suffix-spelled-after-a-dot → file-carries-its-role-suffix · MUST

A role file is `<name>.<role>.ts` — `order.entity.ts`, `orders.repository.ts` — its role spelled as the vocabulary spells it.

| Why | Tags |
|---|---|
| the dot sets the role apart from a kebab-case name of several words, so the role reads the same way in every folder. | [] |
