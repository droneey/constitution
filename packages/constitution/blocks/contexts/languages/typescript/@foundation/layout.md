# Layout

> Governs a TypeScript file: the kinds of file, and the names and extensions of source files.

## Vocabulary

A **typed file** is a file that can carry types: a `.ts`, `.tsx`, `.mts` or `.cts` file. A `.js`, `.mjs` or `.cjs` file carries none.

A source file is **`.ts`**{#typescript-source}, and one that writes markup **`.tsx`**{#typescript-markup-source}.

A folder's surface is its **`index.ts`**{#surface}, and a program starts at **`main.ts`**{#entry}.

An ambient declaration, which describes what exists without an import, lives in a **`.d.ts`**{#ambient-declaration} file.

## Kinds

### source-file-is-a-typescript-file · MUST

Every source file is a typed file, never a JavaScript file. Exempt: a file a framework or a tool reads by its spelling, which its block names.

| Why |
|---|
| a JavaScript file among the sources carries no types, so it escapes every check of them and hands the typed files values no check saw. |

### typescript-source-spelled-ts-or-tsx → format-has-one-extension · MUST

Every typed file among the sources is a `.ts` file or a `.tsx` file, never a `.mts` or a `.cts` file. Exempt: a file a framework or a tool reads by its spelling, which its block names.

| Why |
|---|
| a source file with another extension is missed by every glob and tool written for the one spelling. |

### tsx-only-where-markup-is-written · MUST

Every `.tsx` file writes markup.

| Why |
|---|
| a `.tsx` file that writes no markup tells its reader it renders when it does not, and is parsed for markup it does not hold. |

## Names

### source-file-named-in-kebab-case → file-name-in-its-owners-case · MUST

Every source file's name is in kebab-case. Exempt: a name a framework or a tool reads by its spelling, which its block names.

| Why |
|---|
| a file in another case is missed by the reader who looks for it by its name, and two names that differ only by case collide on a file system that ignores case. |

### file-named-after-its-export → file-named-after-its-topic · SHOULD

Every file is named after what it exports. A file of several exports is named after the unit they form. Exempt: a surface, an entry file, a name a framework or a tool reads by its spelling, which its block names, and a file of specs or of fixtures, which is named after what it proves or builds.

| Why |
|---|
| a file named otherwise is not found by the name of what it holds, so a reader who knows the thing searches the folder for its file. |
