# Templates

> The files a release starts a project from, in `.droneey/constitution/templates/`.

## The project's own files

`/constitution:ratify` writes these:

| Template | Becomes |
|---|---|
| `constitution.yaml` | the project's blocks, check and overrides; [every key](constitution-yaml.md) |
| `PROJECT.md` | the product: its users, domains, entities, boundaries, critical scenarios and glossary |
| `DECISIONS.md` | the log of the project's choices between real alternatives, when it has none |
| `block.md` | a draft block of the project's own pack, for a library without one |

## Starter files

For a tool whose configuration cannot extend the presets, a project starts from these, in `templates/project/<scope>/<block>/`, when it takes the block:

| Scope | Block | File | Holds |
|---|---|---|---|
| common | core | `.editorconfig` | two spaces, LF, UTF-8, and shfmt's options |
| common | core | `.gitignore` | `/.droneey`, the system's files, `.env` files but the example, logs |
| python | python | `.gitignore` | bytecode and the caches of the Python tools |
| python | python | `pyproject.toml` | the pinned tools, uv, the Ruff chain, pytest and its coverage gate, mutmut, the import contracts |
| python | python | `tests/conftest.py` | a fixture that refuses the network in unit specs |
| typescript | typescript | `.gitignore` | `node_modules`, logs, caches, `.npmrc` |
| typescript | bun | `bunfig.toml` | unit specs in a sandbox and in random order, and a minimum age for new packages |
| typescript | bun | `bunfig.integration.toml` | the integration run and its coverage gate |
| typescript | bun | `bunfig.mutation.toml` | the specs a mutation run uses |
| typescript | bun | `src/__tests__/sandbox.fixtures.ts` | `fetch`, sockets and SQL that throw in specs |
| typescript | lingui | `src/__tests__/lingui.fixtures.ts` | Lingui's macros and catalogs compiled for specs |
| typescript | nestjs | `.swcrc` | the decorator metadata Nest's injector reads |
| typescript | react-dom | `src/__tests__/dom.fixtures.ts` | the DOM globals of happy-dom for specs |
| typescript | ts-reset | `src/reset.d.ts` | ts-reset, so parsed JSON is `unknown` |
