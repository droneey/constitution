# Layout

> Governs a file or a folder: its kind, name, size and purpose; readmes.

A package keeps its source, what it ships, in **`src/`**{#source}, and the code that only builds it — a build program, a generator's configuration — in **`scripts/`**{#build-code}; a spec sits beside the code it proves in **`__tests__/`**{#colocated-specs}, or apart from the source in **`tests/`**{#package-suites}, and an end-to-end spec in **`e2e/`**{#end-to-end-suite} inside `tests/`.

## Kinds

### file-named-for-its-kind · MUST

A file of a kind this table names carries that name, and the name marks nothing else: a generated file carries `.gen` or sits in a folder `*.gen/`; a spec is `<name>.test`, `<name>.integration.test` or `<name>.e2e.test`; a fake is `<contract>.fake`; a contract suite is `<contract>.suite`; fixtures are `<name>.fixtures`; a golden file is `<name>.golden.<ext>`, and a snapshot is the file its runner names; a repository’s or a module’s readme is `README.md`. The language fixes the spelling of its own files.

| Why |
|---|
| the name tells a reader and a tool what a file is before it is opened. |

### generated-file-never-edited · MUST

A generated file is never edited by hand: a change goes to its source, and the file is generated again.

| Why |
|---|
| a hand edit to a generated file is lost at the next generation. |

### generated-file-made-by-its-own-step · SHOULD

A generated file is made by a step of its own, run before whatever reads it, never by the build that makes what the code ships.

| Why |
|---|
| a build that also generates mixes what the code ships with what reads it, and whatever needs the generated file runs the whole build first. |

### file-is-one-semantic-unit · SHOULD

A file holds one semantic unit and is named after it; an unrelated export goes to its own file.

| Why |
|---|
| a file’s name then tells what is inside, and a change to one unit touches one file. |

### file-within-500-lines · MUST

A file of code the project writes holds at most 500 lines; test code, a generated file, a document and data have no line limit.

| Why |
|---|
| past this size a file stops being one unit a reader can hold. |

## Names

### file-name-in-its-owners-case · MUST

A file or a folder takes the case its owner fixes — the language for its source files and the folders its modules live in, a tool or a convention for a name it looks up — and kebab-case wherever the choice is the project’s.

| Why |
|---|
| one case removes a decision from every new file and keeps names portable across file systems. |

### format-has-one-extension · SHOULD

A format has one extension across the repository, the one its own specification recommends, unless a tool reads a file only by a fixed name.

| Why |
|---|
| one spelling of a format lets every glob, tool and reader find all of its files. |

## Folders

### build-code-kept-out-of-the-source · MUST

Code that only builds or generates a package, and never ships with it, sits in `scripts/`, never in `src/`.

| Why |
|---|
| `src/` then holds exactly what a consumer runs, so the rules on shipped code — the dependencies it may import above all — hold there with no exception for build code. |

### folder-has-one-purpose-and-is-named-for-it · SHOULD

A folder holds one purpose, said in one phrase without “and”, and is named for it — what its contents are for — never by a catch-all word such as `helpers`, `misc` or `stuff`; a role a block's vocabulary names with its purpose is no catch-all.

| Why |
|---|
| a folder of two purposes gives a new file two places to go, and a catch-all name tells nothing about the system. |

### folder-appears-with-its-first-file · SHOULD

A folder appears when its first file does, never ahead of what it will hold.

| Why |
|---|
| a folder made in advance shows a part the program does not have, and its name guesses a purpose before the code has one. |

### set-folder-holds-only-members · SHOULD

Files of one kind that arrive one at a time — one per vendor, command or rule — live in a folder named for the members in the plural, and nothing else lives there; their contract, registry and runner sit beside it.

| Why |
|---|
| adding a member is adding a file, and nobody has to tell members from machinery by their names. |

## Readmes and writing

### readme-is-the-front-door · SHOULD

A repository’s readme says what the repository is, how to install and run it, and how to change it, for a reader who knows nothing else.

| Why |
|---|
| the readme is the first page anyone opens. |

### module-readme-holds-its-knowledge · SHOULD

Knowledge about a module that its code cannot show lives in a readme beside it; writing for readers outside the code — users, integrators, operators — is kept apart from the code.

| Why |
|---|
| knowledge beside its module changes with it, while one folder of everything drifts from the code it describes. |
