# Project Context

> The stable, high-level context of the product: what it is, who it is for, the domains of its business, its core entities, its boundaries and its words. Read it first so any change fits the product, not just the task.

## One-liner

The Droneey Constitution: the engineering rules every Droneey repository is built by, delivered as a release archive each project pins, which a Claude Code plugin reads.

## Context and users

- **The owner** writes and amends the rules, and decides every change.
- **Agents** in the owner's repositories receive the rules at session start and follow them while they work.
- **The owner's repositories** declare the blocks they follow in `constitution.yaml` and describe themselves in `PROJECT.md`.

## Domains of the business

- **Blocks** — the rules, split by layer — core, domains, contexts, implementations — and inside each block by axis: the base at its root, and the optional `architecture` and `workflow` in a folder each.
- **Validation** — the checks that keep every block sound and consistent with the others.
- **Presets** — the tool configurations that hold the tool-checked rules, split into parts by scope, tool and axis, with the bindings that say which setting holds which rule.
- **Delivery** — the release archive `constitution.tar.gz`, which a project pins through mise and which carries the blocks, the digests generated from them, the presets and the templates; and the plugin, the engine installed from its release tag: the session-start hook that reads the project's digests, the skills that write a project's files, and the reviewer agent.

## Core entities and relationships

- **Block** — `requires` or `extends` blocks of the layers above, and holds rules.
- **Rule** — belongs to one block, and may tighten one rule of another.
- **Requirement answer** — a library block's answer to a requirement of a block above it.
- **Digest** — built by the hook from a project's `constitution.yaml` and the blocks of its release.
- **Preset part** — belongs to one tool's preset, and is named after one block.
- **Binding** — ties settings of one part to one rule.
- **Decision** — an entry of `DECISIONS.md`: why a rule of the Constitution is what it is.

## Critical scenarios

- A session in a repository with `constitution.yaml` starts with a digest of its active blocks, within budget, and the warnings about its file.
- A change to a block that breaks the format, the layers or the digests fails `bun run check`.

## Boundaries — what it does not do

- It installs nothing into a project: no code, no configuration, no generated file. A project extends the presets of its release archive from its own configuration.
- It does not run a project's checks; the project's own check command does.

## Glossary

- **Block** — a folder of rules about one thing a project may have: core, a domain, a platform, a language, a library or a tool.
- **Layer** — core, domains, contexts or implementations: the folder a block sits in, from the widest to the narrowest.
- **Axis** — the base, `architecture` or `workflow`: where a rule sits in its block; a project always follows the base and chooses the others.
- **Card** — a block's `<id>.md`: its front matter, its summary and the rules of its main chapter.
- **Chapter** — a file of a block, named for what its rules govern.
- **Seam** — a `with/<other>.md` file: the rules that hold only when two blocks meet.
- **Rule** — a heading with a slug and a level, a statement, its Why and its tags.
- **Level** — `MUST`, `SHOULD` or `MAY`: how hard a rule binds.
- **Lens** — a tag on a rule, for a review of one concern across every block.
- **Active set** — the blocks a project follows: core, the blocks it lists, and the bases they extend.
- **Unit** — a path under `packages:` whose files follow blocks of their own.
- **Override** — a project's recorded lowering of one rule, with the user's consent and a reason.
- **Pack** — a folder of blocks beside the Constitution's, shaped like it, that a project lists under `packs:`.
- **Release** — a tagged version of the Constitution, installed by mise into `.droneey/constitution/`.
- **Preset** — the configuration of one tool that holds rules, split into parts.
- **Part** — one file of a preset, named after the block its settings need.
- **Binding** — an entry of `bindings.yaml`: which setting of which part holds which rule.
- **Digest** — what the plugin gives an agent at the start of a session: the release, the warnings and the active blocks.
- **Check** — the one command that runs every tool, named by `check:`.
- **Owned word** — a brand, a language or a file name that only its block and the blocks that depend on it may write.

## Non-functional notes

- The hook runs on bash 3.2 and any POSIX awk, with no other runtime, on macOS and Linux.
- The digest stays within 9,400 bytes after its header; core's part within 3,500.
- The repository is public: no private project is named in a committed file.
