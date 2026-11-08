# Layout

> Governs a file or a folder: its kind, name, size and purpose; readmes, and the links between the repository's files.

## Vocabulary

A package's **source folder** is **`src/`**{#source}, the folder of the code it is built from and ships, its source as the code chapter defines it.

A package's **build-code folder** is **`scripts/`**{#build-code}.

The folder of specs beside the code they prove is **`__tests__/`**{#colocated-specs}, the folder of specs apart from the source **`tests/`**{#package-suites}, and the folder of end-to-end specs **`e2e/`**{#end-to-end-suite}, inside `tests/`.

An **entry file**, **`<entry>`**{#entry}, is a file a program starts at, and a program run in several ways, such as a command line and a server, has one for each.

A folder offers what it holds through its **surface**, **`<surface>`**{#surface}: what it lets code outside it import, in its language's form, such as the file its import resolves to or the names its package exports; a package's surface is the main one of its published entries.

A package's **writing** is its documents for readers outside the code, such as users, integrators and operators.

A file's **topic** is the one thing it is about, such as a type, a function, a class, a component, a program's entry or a set of texts, with what only that thing uses.

The kinds of file and their marks are: a generated file, **`.gen`**{#generated-file}, or a folder **`*.gen/`**{#generated-folder} it sits in; a spec, **`.test`**{#spec-file}, **`.integration.test`**{#integration-spec-file} or **`.e2e.test`**{#end-to-end-spec-file}; a fake, **`.fake`**{#fake-file}, and a contract suite, **`.suite`**{#contract-suite-file}, after their contract; fixtures, **`.fixtures`**{#fixtures-file}; a golden file, **`.golden`**{#golden-file} and its format's extension; a repository's or a module's readme, **`README.md`**{#readme}; a snapshot, the mark its test runner gives it; and an example that renders a unit in isolation, the mark the tool that renders it gives it.

The project's **name case** is **kebab-case**{#name-case}.

The **catch-all names**{#catch-all-names} are words such as `helpers`, `misc` and `stuff`.

Every folder, mark and case named here is a default.

## Kinds

### file-named-for-its-kind · MUST

Every file of a kind the vocabulary names carries its kind's mark. Exempt: a generated file that sits in its kind's marked folder, and a generated file or folder whose name the tool that writes it fixes, such as a native project a generator writes or a compiler's cache folder.

| Why |
|---|
| a file named off its kind is missed by the tool that finds the kind by its name, as a spec that never runs or a generated file left in the checks. |

### spec-folder-file-carries-its-kinds-mark · MUST

Every file of test code in a folder of specs carries the mark of its kind: a spec, a fake, a contract suite, fixtures, a golden file, a snapshot or an example. Exempt: a file a test runner, the language or another tool reads by its name, such as a runner's setup file.

| Why |
|---|
| a test runner finds a spec by its mark, so a spec in a folder of specs that carries none never runs and what it should prove goes unchecked, while a fake or fixtures there with no mark are what neither a reader nor a tool can tell from such a spec. |

### kind-mark-marks-only-its-kind · MUST

Every mark of a kind the vocabulary names marks only files of that kind.

| Why |
|---|
| a mark on a file of another kind makes a reader and a tool take one kind for the other, so a tool runs or skips it as what it is not. |

### generated-file-never-edited · MUST

Every generated file changes only by being generated again from its source, never by hand.

| Why |
|---|
| a hand edit to a generated file is lost at the next generation. |

### generated-file-made-by-its-own-step · SHOULD

Every generated file is made by a step of its own, run before whatever reads it. It is never made as part of the build that makes what the code ships.

| Why |
|---|
| a file only the build makes forces whatever reads it (a type check, a spec, another unit) to run the whole build first, and mixes what the code ships with what only its readers need. |

## Contents

### file-holds-one-topic · SHOULD

Every file holds one topic. An unrelated export goes to its own file.

| Why |
|---|
| a file of two topics hides one behind the other, so a reader looks for it elsewhere, and a change to either touches the file of both. |

### file-named-after-its-topic · SHOULD

Every file is named after its topic.

| Why |
|---|
| a file named for anything but its topic sends the reader who looks for that topic to another file. |

### file-within-500-lines · MUST

Every file of code the project writes holds at most 500 lines. Exempt: test code, a generated file, a document and data.

| Why |
|---|
| past this size a file no longer fits in a reader's head as a whole, so a change to it is made without seeing what else it touches. |

## Names

### file-name-in-its-owners-case · MUST

Every file or folder is named in its owner's name case, and in the project's where the choice is the project's. A name case is the case a kind of name is written in. The owner's name case is the language's for its source files and module folders, and a tool's or a convention's for a name it looks up.

| Why |
|---|
| names in mixed cases are argued over at every new file, and two names that differ only by case collide on a file system that ignores case. |

### format-has-one-extension · MUST

Every format has one extension across the repository. Exempt: a file a tool reads only by a fixed name.

| Why |
|---|
| a format spelled two ways is missed by every glob, tool and reader that looks for one spelling of it. |

## Folders

### build-code-kept-out-of-the-source · MUST

All code that only builds or generates a package sits in the build-code folder, never in the source folder. It is code that never ships with the package, such as a build program or a generator's configuration. Exempt: a file its tool finds only by a fixed name.

| Why |
|---|
| build code in the source either ships to consumers or needs an exception from the rules on shipped code (the dependencies it may import above all) and each exception loosens them for the code that does ship. |

### package-part-sits-in-its-named-folder · MUST

Every package's source and specs sit in the folders the vocabulary names for them. Its source sits in the source folder, a spec kept beside the code it proves in `__tests__/`, one kept apart from the source in `tests/`, and an end-to-end spec in `e2e/` inside `tests/`.

| Why |
|---|
| a source or a spec kept in a folder of another name is missed by every tool and reader that looks for it under the name the blocks give, as a spec that never runs or a source left out of the build. |

### tool-file-sits-beside-the-manifest · MUST

Every file a tool reads as a package's settings sits beside the package's manifest.

| Why |
|---|
| a tool's file kept anywhere but beside the manifest is missed by the tool that looks it up there, or found only by a reader who knows where it went. |

### package-specs-kept-apart-from-the-mirror-tree · SHOULD

Where the test runner expects a tree of specs mirroring the source, every spec driving the built package sits apart from it.

| Why |
|---|
| a spec of the built package inside the tree that mirrors the source is read as a spec of the unit at its path, and is moved or deleted with that unit. |

### folder-has-one-purpose · SHOULD

Every folder holds one purpose, said in one phrase without "and".

| Why |
|---|
| a folder of two purposes gives a new file two places to go, until nobody can say which place a file takes. |

### folder-named-for-its-purpose · SHOULD

Every folder's name says what its contents are for, never a catch-all name. Exempt: a role a block's vocabulary names with its purpose.

| Why |
|---|
| a folder named by a catch-all word draws every file that has no other home, until nobody can say what it holds. |

### set-folder-holds-only-members · SHOULD

The members of every open set live in a folder of their own, and nothing else lives there.

| Why |
|---|
| members mixed with their machinery are told apart only by their names, so a member is taken for machinery or the reverse, and adding one means first finding where it goes. |

### set-machinery-sits-beside-its-members · SHOULD

Every open set's contract, the file that registers its members and the code that runs them sit beside its members' folder.

| Why |
|---|
| machinery kept away from its members' folder is searched for by whoever adds a member, and a member added without it is never registered or run. |

### set-folder-named-in-the-plural · SHOULD

Every folder of an open set's members is named for them, in the plural.

| Why |
|---|
| a set's folder named otherwise hides where a new member goes, and a singular name reads as one member's home. |

## Readmes and writing

### readme-is-the-front-door · SHOULD

Every repository's readme answers what a newcomer asks first. For a reader who knows nothing else, it answers what the repository is, what problem it solves and for whom, how to get it running as lines to copy into a terminal, and how to change it or where that is written.

| Why |
|---|
| the readme is the first page anyone opens, and one that leaves these questions open sends a newcomer to the code or to a person for what one page could say. |

### module-readme-holds-its-knowledge · SHOULD

All knowledge about a module as a whole that its code cannot show lives in a readme beside it. That knowledge is for the module's readers in the code.

| Why |
|---|
| knowledge kept far from its module, in one folder of everything, is not changed when the module is, and drifts until it misleads the reader who trusts it. |

### repository-link-resolves · MUST

Every link between files of the repository leads to a target that exists: the file, and the heading or anchor its fragment names.

| Why |
|---|
| a broken link sends the reader nowhere just when they need the page, and a moved file or a renamed heading breaks links far from the change. |
