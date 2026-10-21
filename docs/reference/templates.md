# Templates

> The files a project starts from: its own files, and a fragment of each block's for the files the block gives.

A release keeps them in `.droneey/constitution/templates/`.

## Written by ratify

`/constitution:ratify` writes the project's own files from these:

| Template | Becomes |
|---|---|
| `constitution.yaml` | the project's blocks, check and overrides; [every key](constitution-yaml.md) |
| `PROJECT.md` | the product: its users, domains, entities, boundaries, critical scenarios and glossary |
| `DECISIONS.md` | the log of the project's choices between real alternatives, when it has none |
| `block/` | a draft block of the project's own pack, for a library without one: its passport `block.md`, renamed `<id>.md`, and a chapter `foundation/chapter.md`, renamed after the subject of its rules |

## Fragments of the blocks

A block that gives a project a file keeps a fragment of it in `templates/project/<scope>/<block>/<path>`, the path the file takes in a unit: `common` for a file of any language, or the language of its files. Several active blocks may give a file of one path — `.gitignore` of `core`, `python` and `typescript`, `pyproject.toml` of Python and each of its tools. `/constitution:ratify` assembles the file from the fragments of the unit's active blocks, one after the other, each under its block's line — `# core: …` — or, in a table or a list of a structured file, inside that table or list. A file a tool reads from the folders above, as git reads `.gitignore`, takes in a unit only the fragments of the blocks the unit adds. A fragment written into a file another block owns is written only when that block is active: a tool's `[tool.poe.tasks]` only with `poe`, Stryker's `bunfig.mutation.toml` only with `bun-test`.

Every tool with [parts](presets.md) has a fragment of its configuration that shows how the tool takes them, and `blocks:check` refuses a tool without one, and a fragment in a folder that names no block. Its placeholders:

| Placeholder | Becomes |
|---|---|
| `<presets>` | the path from the file to the release's `presets` folder, starting with `./` or `../` |
| `<parts>` | the paths of the parts [the computation](presets.md#the-parts-a-project-takes) lists, relative to the file; one entry each in a list, one import each in code |
| `<chain end>` | the part none of the others extends |
| `<copied parts>` | the content of each part, unchanged save `<package>`, filled as below, each between its own lines `# from <path>` and `# end <path>` |
| `<name>`, `<package>` | the project's name, and the import package of its code |
| `<Dockerfile>` | the path of the Dockerfile a task of `mise.toml` names, proposed from the repository and asked of the owner |
| `<compose files>` | the paths of the Compose files a task of `mise.toml` names, proposed from the repository and asked of the owner |
| `<every other task the fragments give, in order>` | in poe's `check`, every other task the fragments give, in the order printed |

A file that holds the project's own settings keeps them after the parts.

## Starter files

Besides the configurations of the tools, the fragments give a project these:

| Block | File | Holds |
|---|---|---|
| core | `.editorconfig` | two spaces, LF, UTF-8, and shfmt's options |
| core | `.gitignore` | `/.droneey`, the system's files, `.env` files but the example, logs |
| python | `pyproject.toml` | the project |
| uv | `pyproject.toml` | uv's install settings and the build backend |
| poe | `pyproject.toml` | the task runner, pinned, and the `check` task that runs every other one |
| pytest | `tests/conftest.py` | a fixture that refuses the network in unit specs |
| bun | `bunfig.toml` | the install's cooldown, and tools run on Bun |
| bun-test | `bunfig.toml`, `bunfig.integration.toml` | the unit run in a sandbox and in random order, the integration run with its coverage gate |
| bun-test | `src/__tests__/sandbox.fixtures.ts` | `fetch`, sockets and SQL that throw in specs |
| stryker | `bunfig.mutation.toml` | the specs a mutation run uses |
| lingui | `src/__tests__/lingui.fixtures.ts` | Lingui's macros and catalogs compiled for specs |
| nestjs | `.swcrc` | the decorator metadata Nest's injector reads |
| nestjs | `tsconfig.json` | the decorator options, in its own `compilerOptions`, since Bun applies them only from there, not through `extends` |
| react-dom | `src/__tests__/dom.fixtures.ts` | the DOM globals of happy-dom for specs |
| ts-reset | `src/reset.d.ts` | ts-reset, so parsed JSON is `unknown` |
