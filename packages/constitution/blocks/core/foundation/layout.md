# Layout

> Governs a file or a folder: its kind, name, size and purpose; readmes.

A package keeps its source, what it ships, in **`src/`**{#source}, and the code that only builds it — a build program, a generator's configuration — in **`scripts/`**{#build-code}; a spec sits beside the code it proves in **`__tests__/`**{#colocated-specs}, or apart from the source in **`tests/`**{#package-suites}, and an end-to-end spec in **`e2e/`**{#end-to-end-suite} inside `tests/`. A program starts at its **`<entry>`**{#entry}, and a folder offers what it holds through its **`<surface>`**{#surface}, the file its import resolves to. Core gives each of these, and the value of absence, the checked constructor and the error suffix its other chapters name, as a default — the folders as the Constitution's first languages spell them, the rest as a role —, and a language's block respells each under the same id; for a language with no block, the project's own pack does, and core's default shows the pattern until then.

## Kinds

### file-named-for-its-kind · MUST

A file of a kind named here carries its kind's name, and that name marks nothing else. A generated file carries **`.gen`**{#generated-file} or sits in a folder `*.gen/`; a spec is `<name>` and **`.test`**{#spec-file}, **`.integration.test`**{#integration-spec-file} or **`.e2e.test`**{#end-to-end-spec-file}. A fake is `<contract>` and **`.fake`**{#fake-file}; a contract suite is `<contract>` and **`.suite`**{#contract-suite-file}; fixtures are `<name>` and **`.fixtures`**{#fixtures-file}; a golden file is `<name>`, **`.golden`**{#golden-file} and its format's extension, and a snapshot is the file its runner names. A file of the text a person reads and the templates that fill it with values, holding no branch, carries **`.messages`**{#message-file}, and a repository’s or a module’s readme is **`README.md`**{#readme}. Each name is a default, which a language's block respells for its own files.

| Why |
|---|
| a file named off its kind is missed by the tool that finds that kind by its name (a spec that never runs, a generated file left in the checks) and a name that marks two kinds makes a reader and a tool take one for the other. |

### text-a-person-reads-held-in-a-messages-file · SHOULD

The text a unit writes for a person to read sits in a `.messages` file beside the unit. That text includes a message, a command's help and the wording of a report, but not the message an error is built with; the logic that chooses a text — a plural, a variant — sits outside the file and names the messages it chooses from.

| Why |
|---|
| text written inside logic is reworded by editing that logic, and the mutation tools can leave its mutants out only by a guess; a choice of text left inside a messages file goes unmeasured, since the tools leave that file out by its kind. |

### generated-file-never-edited · MUST

A generated file is never edited by hand. A change goes to its source, and the file is generated again.

| Why |
|---|
| a hand edit to a generated file is lost at the next generation. |

### generated-file-made-by-its-own-step · SHOULD

A generated file is made by a step of its own. The step runs before whatever reads the file, never as part of the build that makes what the code ships.

| Why |
|---|
| a file only the build makes forces whatever reads it (a type check, a spec, another unit) to run the whole build first, and mixes what the code ships with what only its readers need. |

## Contents

### file-is-one-semantic-unit · SHOULD

A file holds one semantic unit and is named after it. An unrelated export goes to its own file.

| Why |
|---|
| a file of two units hides one behind the other's name, so a reader looks for it elsewhere, and a change to either touches the file of both. |

### file-within-500-lines · MUST

A file of code the project writes holds at most 500 lines. Test code, a generated file, a document and data have no line limit.

| Why |
|---|
| past this size a file no longer fits in a reader's head as one unit, so a change to it is made without seeing what else it touches. |

## Names

### file-name-in-its-owners-case · MUST

A file or a folder is named in its owner's case, and in kebab-case where the choice is the project's. Its owner is the language for its source files and the folders its modules live in, and a tool or a convention for a name it looks up.

| Why |
|---|
| names in mixed cases are argued over at every new file, and two names that differ only by case collide on a file system that ignores case. |

### format-has-one-extension · SHOULD

A format has one extension across the repository. It is the one the format's own specification recommends, unless a tool reads a file only by a fixed name.

| Why |
|---|
| a format spelled two ways is missed by every glob, tool and reader that looks for one spelling of it. |

## Folders

### build-code-kept-out-of-the-source · MUST

Code that only builds or generates a package, and never ships with it, sits in `scripts/`, never in `src/`.

| Why |
|---|
| build code in `src/` either ships to consumers or needs an exception from the rules on shipped code (the dependencies it may import above all) and each exception loosens them for the code that does ship. |

### package-root-holds-each-part-in-its-place · SHOULD

A package's root holds each of its parts in a place of its own. It holds the package's manifest and the files tools look up there, its source in `src/`, the suites that drive the built package in `tests/` and, where the language's runner expects one, the tree of specs that mirrors the source, the writing for readers outside the code, and one folder per kind of content the package ships as it is.

| Why |
|---|
| a package whose root is laid out its own way must be searched before it is changed, and a file with two plausible places at its root ends up in both. |

### folder-has-one-purpose-and-is-named-for-it · SHOULD

A folder holds one purpose, is named for it, and appears with its first file. The purpose is said in one phrase without “and”, and the name says what the folder's contents are for, never a catch-all word such as `helpers`, `misc` or `stuff`; a role a block's vocabulary names with its purpose is no catch-all, and no folder is made ahead of what it will hold.

| Why |
|---|
| a folder of two purposes gives a new file two places to go, one named by a catch-all word draws every file that has no other home, until nobody can say what it holds, and one made in advance shows a part the program does not have, its name a guess at a purpose the code does not yet have. |

### set-folder-holds-only-members · SHOULD

The members of a set live in a folder of their own, and nothing else lives there. Members are files of one kind that arrive one at a time — one per vendor, command or rule; their folder is named for them in the plural, and their contract, registry and runner sit beside it.

| Why |
|---|
| members mixed with their machinery are told apart only by their names, so a member is taken for machinery or the reverse, and adding one means first finding where it goes. |

## Readmes and writing

### readme-is-the-front-door · SHOULD

A repository’s readme answers what a newcomer asks first. For a reader who knows nothing else, it answers what the repository is and what problem it solves, for whom; how to get it running, as commands to copy; and how to change it, or where that is written.

| Why |
|---|
| the readme is the first page anyone opens, and one that leaves these questions open sends a newcomer to the code or to a person for what one page could say. |

### module-readme-holds-its-knowledge · SHOULD

Knowledge about a module that its code cannot show lives in a readme beside it. That knowledge is for the module's readers in the code; writing for readers outside the code — users, integrators, operators — is none of it and has a place of its own.

| Why |
|---|
| knowledge kept far from its module, in one folder of everything, is not changed when the module is, and drifts until it misleads the reader who trusts it. |
