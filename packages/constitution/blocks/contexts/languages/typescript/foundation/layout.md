# Layout

> Governs a TypeScript file: the names and extensions of source and test files.

## Kinds

### file-named-after-its-export → file-is-one-semantic-unit · MUST

A file is named after what it exports. With several exports, it is named after the unit they form; a name a framework or a tool reads by its spelling, which its block names, is exempt.

| Why |
|---|
| a file named otherwise is not found by the name of what it holds, so a reader who knows the thing searches the folder for its file. |

### test-folder-files-in-test-forms → file-named-for-its-kind · MUST

A TypeScript file in a folder of specs takes a test form. A `.ts` or `.tsx` file in `__tests__/` or `tests/` is a `.test`, `.<kind>.test`, `.fake`, `.suite` or `.fixtures` file.

| Why |
|---|
| a spec named otherwise would never run, and a helper named like a spec would run as one. |

## Names

### source-file-named-in-kebab-case → file-name-in-its-owners-case · MUST

A source file is a kebab-case **`.ts`**{#typescript-source} or **`.tsx`**{#typescript-markup-source} file. A name a framework or a tool reads by its spelling, which its block names, is exempt.

| Why |
|---|
| a file in another case or with another extension is missed by the reader who looks for it by its name and by every glob written for the one spelling. |

### tsx-only-where-markup-is-written · MUST

A file is `.tsx` only where it writes markup.

| Why |
|---|
| a `.tsx` file that writes no markup tells its reader it renders when it does not, and is parsed for markup it does not hold. |
