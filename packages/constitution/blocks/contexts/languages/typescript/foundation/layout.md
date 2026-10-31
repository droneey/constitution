# Layout

> Governs a TypeScript file: the names and extensions of source and test files.

## Kinds

### test-folder-files-in-test-forms → file-named-for-its-kind · MUST

A `.ts` or `.tsx` file in `__tests__/` or `tests/` is a `.test`, `.<kind>.test`, `.fake`, `.suite` or `.fixtures` file.

| Why |
|---|
| a spec named otherwise would never run, and a helper named like a spec would run as one. |

## Names

### source-file-named-in-kebab-case → file-name-in-its-owners-case · MUST

A source file is a kebab-case **`.ts`**{#typescript-source} or **`.tsx`**{#typescript-markup-source} file, save a name a framework or a tool reads by its spelling, which its block names.

| Why |
|---|
| one spelling of every kind of file lets the reader find a file by its name. |

### tsx-only-where-markup-is-written · MUST

A file is `.tsx` only where it writes markup.

| Why |
|---|
| the extension then says which files render, and a plain module is never parsed for markup. |
