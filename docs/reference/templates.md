# Templates

> The files a project starts from: its own `constitution.yaml`, `PROJECT.md` and `DECISIONS.md`, and a new block's skeleton.

A release keeps them in `.droneey/constitution/templates/`.

## Written by ratify

`/constitution:ratify` writes the project's own files from these:

| Template | Becomes |
|---|---|
| `constitution.yaml` | the project's blocks, check and overrides; [every key](constitution-yaml.md) |
| `PROJECT.md` | the product: its users, domains, entities, boundaries, critical scenarios and glossary |
| `DECISIONS.md` | the log of the project's choices between real alternatives, when it has none |
| `block/` | a draft block of the project's own pack, for a library without one: its passport `block.md`, renamed `<id>.md`, and a chapter `foundation/chapter.md`, renamed after the subject of its rules |

## The files the blocks give

A block that gives a project a file, a whole file or settings in one, does it through [its preset entries](presets.md): `constitution presets apply` writes them, and a starting file — `.editorconfig`, `tests/conftest.py`, `src/__tests__/sandbox.fixtures.ts` — is an entry written once with `!default`, while the unit lacks it.
