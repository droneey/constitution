# Project Context

> The stable, high-level context of the product: what it is, who it is for, the subdomains of its business by class, its core entities, its boundaries and its words. Read it first so any change fits the product, not just the task.

## One-liner

The Droneey Constitution: the engineering rules every Droneey repository is built by, delivered as a distribution each project pins, which a Claude Code plugin reads.

## Context and users

- **The owner** writes and amends the rules, and decides every change.
- **Agents** in the owner's repositories receive the rules before each action and follow them while they work; a fresh reviewer agent judges their changes before they hand back.
- **The owner's repositories** declare the blocks they follow in `constitution.yaml` and describe themselves in `PROJECT.md`.

## Subdomains

- **Blocks** (core domain) — the rules, split by rank — core, domains, contexts, implementations — each block a folder that may hold child blocks, and inside each block by axis, a folder each of one form: `@foundation`, always followed, and the optional `@architecture` and `@workflow`.
- **Validation** (supporting; the `blocks` feature) — the checks that keep every block, the Constitution's and a pack's, sound and consistent with the others.
- **Presets** (supporting; the `presets` feature) — the settings that hold the tool-checked rules, each keyed by the rule it holds, which the executable writes into a project's configurations, and the plugins and shell scripts those configurations run.
- **Delivery** (supporting; the `project`, `session` and `installation` features) — the release's distribution, one for each platform, `constitution-<platform>.tar.gz`, which a project pins through mise and which carries the blocks, the presets with their plugins and scripts, the templates, the tools the presets run and the `constitution` executable compiled for that platform, which checks a project and does the hooks' work; and the plugin, the engine installed from its release tag: the hooks — the digest at a session's start, the rule gate before an action, the record after it, the hand-back at a stop, and the clean-up at a session's end — the skills that write a project's files, and the reviewer agent.

## Core entities and relationships

- **Block** — sits in one rank, under the block whose folder holds it, `requires` blocks of its own rank or of the ranks above it, and holds rules.
- **Rule** — belongs to one block, binds at `MUST` or `SHOULD`, and may tighten one rule within its reach.
- **Term** — defined once in a chapter's vocabulary, owned by its block, and used by the rules within its reach.
- **Digest** — built by the hook from a project's `constitution.yaml` and the blocks of its release: core's passport, the duty the rule gate sets, the map of the active blocks and the warnings.
- **Preset entry** — belongs to one tool's preset file, and is keyed by the block and the rule it holds.
- **Override** — a project's lowering of one rule, with its reason.
- **Decision** — an entry of `DECISIONS.md`: why a rule of the Constitution is what it is.

## Boundaries — what it does not do

- It installs nothing into a project's code. The executable writes the presets' settings into the project's configurations only when the project runs `constitution presets apply`, beside the settings the project keeps of its own.
- It does not run a project's checks of itself; `constitution run check` runs the commands the project's runner blocks give.

## Critical scenarios

- A session in a repository with `constitution.yaml` starts with a digest of its active blocks and the warnings about its file.
- In such a repository, the agent's action is refused until it has read, whole, the rules that govern it, and goes through once it has.
- The agent's hand-back is held until the project's check passes on the tree, and then until a fresh reviewer has judged the change against the rules that govern its files.
- A change to a block that breaks the format, the ranks or the reach of its rules fails `bun run constitution run check`.

## Glossary

- **Block** — a folder of rules about one thing a project may have: core, a domain, a platform, a language, a library or a tool.
- **Block id** — a block's path among the blocks of its rank, such as `react/react-dom` or `client/browser`.
- **Rank** — core, domains, contexts or implementations: the tier a block sits in, from the widest to the narrowest.
- **Parent block** — the block whose folder holds another, its child; a child turns on every block it sits under.
- **Axis** — `@foundation`, `@architecture` or `@workflow`: the folder of its block a rule sits in; a project always follows `foundation` and chooses the others.
- **Passport** — a block's `<name>.md` at its root, `<name>` the last part of its id: its front matter, its title, one line of what the block is and its setup; no rule.
- **Chapter** — a file of an axis of a block, `<axis>/<name>.md`, of one subject and named for it in its block's own terms, never after its block; a language's or a platform's chapter that refines one of core's takes its name. It opens with its title and a `> Governs …` line and holds its rules in sections.
- **Section** — a `##` part of a chapter or a seam: `Vocabulary`, first, for the file's definitions; `General` for the rules about the whole subject; then one for each part of it.
- **Seam** — a `with/<other>.md` file of an axis, named after the other block's id: the rules that hold only when two blocks meet.
- **Rule** — a heading with a slug and a level, a statement, its Why and its examples.
- **Slug** — a rule's kebab-case name, one across the Constitution and its packs: preset entries, overrides and other rules name a rule by it.
- **Tightens** — a rule's `→ <rule>` link: it narrows that rule for its block's case, at a level of its own never looser than that rule's.
- **Level** — `MUST` or `SHOULD`: how hard a rule binds; an override may also set a rule to `MAY`, which then only advises.
- **Vocabulary** — a chapter's section of the terms its rules share, each defined once in bold.
- **Active set** — the blocks a project follows: core, the blocks it lists, and the blocks they sit under.
- **Unit** — the repository, or a member of its workspace, whose files follow the blocks of its own `constitution.yaml`.
- **Override** — a project's recorded lowering of one rule, with the user's consent and a reason.
- **Pack** — a folder of blocks beside the Constitution's, shaped like it, that a project lists under `packs:`.
- **Release** — a tagged version of the Constitution, installed by mise into `.droneey/constitution/`.
- **Preset set** — every preset of one pack, the Constitution's or a project's.
- **Preset file** — the settings one tool reads on one axis, `presets/<reader>/@<axis>.yaml`, with those that need a block beyond its reach under `@<axis>/with/`.
- **Entry** — one setting of a preset file, for one rule of a block or the tool's own under `*`, for one language and one file.
- **Preset plugin** — a file of the release a tool runs, under `presets/<tool>/plugins/`: a lint rule named by the rule it holds, or a shell script a command runs; one that names the project's words is copied into the unit, its terms filled in.
- **Lock** — `constitution.lock`, beside a unit's `constitution.yaml`: what the executable last wrote into the unit's files.
- **Template** — a file a project starts from: the starting `constitution.yaml`, `PROJECT.md`, `DECISIONS.md` and a new block's skeleton.
- **Digest** — what the plugin gives an agent at the start of a session: the release, core's passport, the duty the rule gate sets, the active blocks and the warnings.
- **Rule gate** — the hook that refuses an agent's edit, command, sub-agent or MCP call until it has read, whole, the rules that govern it: each governing chapter's vocabulary, then the statements, `MUST` before `SHOULD`, without their Why.
- **Reviewer** — the agent that judges a change in a fresh context, given the diff, the overrides and the rules with their Why.
- **Check** — the one command that runs every tool, `constitution run check`, which runs each unit's `check` as its runner block gives it and names each rule a failed step breaks.
- **Owned word** — a brand, a language or a file name that only its block and the blocks that depend on it may write.

## Non-functional notes

- The hooks run the `constitution` executable, compiled for each platform and installed by mise, through a wrapper bash 3.2 runs; a project needs no other runtime, on macOS and Linux.
- Every text a hook gives stays within 10,000 characters, Claude Code's limit; the digest after its first part within 9,400 bytes.
- A block's file holds at most 1500 lines, its examples counted.
- The repository is public: no private project is named in a committed file.
