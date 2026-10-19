# Templates

> The files a project starts from: its own files, and the configurations of the tools that cannot extend the presets.

A release keeps them in `.droneey/constitution/templates/`.

## Written by ratify

`/constitution:ratify` writes the project's own files from these:

| Template | Becomes |
|---|---|
| `constitution.yaml` | the project's blocks, check and overrides; [every key](constitution-yaml.md) |
| `PROJECT.md` | the product: its users, domains, entities, boundaries, critical scenarios and glossary |
| `DECISIONS.md` | the log of the project's choices between real alternatives, when it has none |
| `block/` | a draft block of the project's own pack, for a library without one: its passport `block.md`, renamed `<id>.md`, and a chapter `foundation/chapter.md`, renamed after the subject of its rules |

## Starter files

A project copies these from `templates/project/<scope>/<block>/` when it takes the block.

### Common

| Block | File | Holds |
|---|---|---|
| core | `.editorconfig` | two spaces, LF, UTF-8, and shfmt's options |
| core | `.gitignore` | `/.droneey`, the system's files, `.env` files but the example, logs |

### Python

| Block | File | Holds |
|---|---|---|
| python | `.gitignore` | bytecode and the caches of the Python tools |
| python | `pyproject.toml` | the pinned tools, uv, the Ruff chain, pytest and its coverage gate, mutmut, the import contracts |
| python | `tests/conftest.py` | a fixture that refuses the network in unit specs |

### TypeScript

| Block | File | Holds |
|---|---|---|
| typescript | `.gitignore` | `node_modules`, logs, caches, `.npmrc` |
| bun | `bunfig.toml` | unit specs in a sandbox and in random order, and a minimum age for new packages |
| bun | `bunfig.integration.toml` | the integration run and its coverage gate |
| bun | `bunfig.mutation.toml` | the specs a mutation run uses |
| bun | `src/__tests__/sandbox.fixtures.ts` | `fetch`, sockets and SQL that throw in specs |
| lingui | `src/__tests__/lingui.fixtures.ts` | Lingui's macros and catalogs compiled for specs |
| nestjs | `.swcrc` | the decorator metadata Nest's injector reads |
| react-dom | `src/__tests__/dom.fixtures.ts` | the DOM globals of happy-dom for specs |
| ts-reset | `src/reset.d.ts` | ts-reset, so parsed JSON is `unknown` |
