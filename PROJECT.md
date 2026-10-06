# Project Context

> The stable, high-level context of the product: what it is, who it is for, the domains of its business, its core entities, its boundaries and its words. Read it first so any change fits the product, not just the task.

## One-liner

The droneey constitution: the engineering rules every droneey repository is built by, delivered to Claude Code as a plugin.

## Context and users

- **The owner** writes and amends the rules, and decides every change.
- **Agents** in the owner's repositories receive the rules at session start and follow them while they work.
- **The owner's repositories** declare the blocks they follow in `constitution.yaml` and describe themselves in `PROJECT.md`.

## Domains of the business

- **Blocks** — the rules, split by layer — core, domains, contexts, implementations — and inside each block by axis: `foundation`, `architecture`, `workflow`.
- **Validation** — the checks that keep every block sound and consistent with the others.
- **Presets** — the tool configurations that hold the tool-checked rules, split into parts by scope, tool and axis, with the bindings that say which setting holds which rule.
- **Delivery** — the digests generated from the blocks, the session-start hook that reads them, the skills that write a project's files, and the release archive that carries the presets and templates.

## Core entities and relationships

- **Block** — a folder under `blocks/` with a main file, its front matter and its rules; it `requires` or `extends` blocks of the layers above.
- **Rule** — a slug, a level, a statement, Why and Tags; it belongs to one block.
- **Requirement answer** — a library block's answer to a requirement of a block above it.
- **Digest** — what the hook prints: the active blocks of a project, core's part and MUST headlines.
- **Preset part** — a file of `presets/<scope>/<tool>/<axis>/`, named after the block its settings need.
- **Binding** — an entry of a preset's `bindings.yaml`: the settings of a part that hold a rule.
- **Decision** — an entry of `DECISIONS.md`: why a rule of the constitution is what it is.

## Critical scenarios

- A session in a repository with `constitution.yaml` starts with a digest of its active blocks, within budget, and the warnings about its file.
- A change to a block that breaks the format, the layers or the digests fails `bun run check`.

## Boundaries — what it does not do

- It installs nothing into a project: no code, no configuration, no generated file. A project extends the presets of its release archive from its own configuration.
- It does not run a project's checks; the project's own check command does.

## Glossary

- **Layer** — one of core, domain, context, implementation: the folder a block sits in.
- **Axis** — `foundation`, `architecture` or `workflow`: the folder a rule sits in inside its block; a project follows `foundation` and the axes it chooses.
- **Active set** — the blocks a project follows: core, the declared blocks and the bases of their `extends` chains.
- **Override** — a project's recorded lowering of one rule, with the user's consent and a reason.
- **Local block** — a block file inside a project, under `rules/`.
- **Lens** — a tag on a rule, for reviewing across all layers at once.
- **Owned word** — a brand, language or file name only its block and the blocks that depend on it may write.

## Non-functional notes

- The hook runs on bash 3.2 and any POSIX awk, with no other runtime, on macOS and Linux.
- The digest stays within 9,400 bytes after its header; core's part within 3,500.
- The repository is public: no private project is named in a committed file.
