# Project Context

> The stable, high-level context of the product: what it is, who it is for, the domains of its business, its core entities, its boundaries and its words. Read it first so any change fits the product, not just the task.

## One-liner

The Droneey Constitution: the engineering rules every Droneey repository is built by, delivered as a release archive each project pins, which a Claude Code plugin reads.

## Context and users

- **The owner** writes and amends the rules, and decides every change.
- **Agents** in the owner's repositories receive the rules at session start and follow them while they work.
- **The owner's repositories** declare the blocks they follow in `constitution.yaml` and describe themselves in `PROJECT.md`.

## Domains of the business

- **Blocks** — the rules, split by layer — core, domains, contexts, implementations — and inside each block by axis, a folder each of one form: `foundation`, always followed, and the optional `architecture` and `workflow`.
- **Validation** — the checks that keep every block sound and consistent with the others.
- **Presets** — the settings that hold the tool-checked rules, each keyed by the rule it holds, which the program writes into a project's configurations.
- **Delivery** — the release archive `constitution.tar.gz`, which a project pins through mise and which carries the blocks, the digests generated from them, the presets and the templates; the `constitution` program of the same release, compiled for each platform, which checks a project and does the hooks' work; and the plugin, the engine installed from its release tag: the session-start hook that reads the project's digests, the skills that write a project's files, and the reviewer agent.

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
- **Axis** — `foundation`, `architecture` or `workflow`: the folder of its block a rule sits in; a project always follows `foundation` and chooses the others.
- **Passport** — a block's `<id>.md` at its root, the one file its id names: its front matter, its title, one line of what the block is, its setup and an implementation's Requirements; no rule.
- **Chapter** — a file of an axis of a block, `<axis>/<name>.md`, of one subject and named for it in its block's own terms, never after its block; a language's or a platform's chapter that refines one of core's takes its name. It opens with its title and a `> Governs …` line and holds its rules in sections.
- **Section** — a `##` part of a chapter or a seam that names a part of its subject: `General`, first, for the rules about the whole subject, and `Requirements for implementation`, last.
- **Seam** — a `with/<other>.md` file: the rules that hold only when two blocks meet.
- **Rule** — a heading with a slug and a level, a statement and its Why.
- **Slug** — a rule's kebab-case name, one across the Constitution and its packs: bindings, overrides and other rules name a rule by it.
- **Tightens** — a rule's `→ <rule>` link: it narrows that rule for its block's case, never looser, and takes its level when it states none.
- **Level** — `MUST`, `SHOULD` or `MAY`: how hard a rule binds.
- **Requirement** — a rule of a `Requirements for implementation` section: what a tool of that kind must offer; an implementation's passport answers each with how and whether it is met.
- **Active set** — the blocks a project follows: core, the blocks it lists, and the bases they extend.
- **Unit** — the repository, or a member of its workspace, whose files follow the blocks of its own `constitution.yaml`.
- **Override** — a project's recorded lowering of one rule, with the user's consent and a reason.
- **Pack** — a folder of blocks beside the Constitution's, shaped like it, that a project lists under `packs:`.
- **Release** — a tagged version of the Constitution, installed by mise into `.droneey/constitution/`.
- **Preset set** — every preset of one pack, the Constitution's or a project's.
- **Preset file** — the settings one tool reads on one axis, `presets/<reader>/<axis>.yaml`, with those that need a block beyond its reach under `with/`.
- **Entry** — one setting of a preset file, for one rule of a block or the tool's own under `*`, for one language and one file.
- **Lock** — `constitution.lock`, beside a unit's `constitution.yaml`: what the program last wrote into the unit's files.
- **Template** — a file a project starts from: the starting `constitution.yaml`, `PROJECT.md`, `DECISIONS.md` and a new block's skeleton.
- **Digest** — what the plugin gives an agent at the start of a session: the release, the warnings and the active blocks.
- **Check** — the one command that runs every tool, named by `check:`.
- **Owned word** — a brand, a language or a file name that only its block and the blocks that depend on it may write.

## Non-functional notes

- The hooks run the `constitution` program, compiled for each platform and installed by mise, through a wrapper bash 3.2 runs; a project needs no other runtime, on macOS and Linux.
- The digest stays within 9,400 bytes after its header; core's part within 3,500.
- The repository is public: no private project is named in a committed file.
