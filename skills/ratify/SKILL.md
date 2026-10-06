---
name: ratify
description: Put a repository under the droneey constitution — look at its code, propose the blocks it follows, and interview the owner, then write constitution.yaml and PROJECT.md after the owner's yes. Use when the owner asks to ratify, adopt or set up the constitution in a repository.
disable-model-invocation: true
---

# Ratify the constitution in this repository

Installed constitution plugin:

!`sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${CLAUDE_PLUGIN_ROOT}/package.json"`

Blocks the plugin offers, by layer — `- <layer> <id>: <summary> Requires: <ids>. Extends: <base>.`:

!`sed -e '/^block[[:cntrl:]]/!d' -e '/^block[[:cntrl:]][^[:cntrl:]]*[[:cntrl:]]core[[:cntrl:]]/d' -e 's/^block[[:cntrl:]]\([^[:cntrl:]]*\)[[:cntrl:]]\([^[:cntrl:]]*\)[[:cntrl:]]\([^[:cntrl:]]*\)[[:cntrl:]][^[:cntrl:]]*[[:cntrl:]][^[:cntrl:]]*[[:cntrl:]]\([^[:cntrl:]]*\)[[:cntrl:]]\([^[:cntrl:]]*\).*/- \2 \1: \3 Requires: \4. Extends: \5./' -e 's/ Requires: \.//' -e 's/ Extends: \.$//' "${CLAUDE_PLUGIN_ROOT}/digests/index.tsv"`

The project folder holds:

!`ls -A "${CLAUDE_PROJECT_DIR}"`

## What you write

- **`constitution.yaml`** at the repository root: the blocks the repository follows, its units, the one command that runs its checks, and its overrides. The session-start hook reads it and gives every agent the rules of those blocks, so a block listed by mistake costs every session, and a block left out leaves its rules unenforced.
- **`PROJECT.md`** beside it: what the product is, for whom, the domains of its business, its entities, its boundaries, its critical scenarios and its glossary. It gives any agent the context of the whole, so a change fits the product and not just the task.
- **A local block** under `./rules/implementations/<id>.md` for each library the owner wants rules for that the plugin has no block for.

The repository root is the folder, going up from the project folder, that holds `.git`. Core is always active and is never listed.

## How to run it

Work in this order, and keep the owner in the loop: propose, let them confirm or correct, move on. Never invent an answer — a wrong block, command or sentence written with confidence is worse than a gap the owner can see.

### 1. Check what is there

If `constitution.yaml` or `PROJECT.md` is already at the root, say so and ask whether to replace it. With a no, leave that file alone: do not write it and skip its part of the work. Either way, build the proposal from the repository and the owner, not from files already there.

### 2. Show what the plugin offers

Tell the owner the installed version and the blocks above, grouped by layer, in a few lines. If the list is empty, the plugin offers no blocks yet: every layer key stays `[]`, and only local blocks can be listed.

### 3. Ask for the axes, then look at the repository and propose the blocks

Every block's rules sit on three axes: `foundation` — what holds for any team; `architecture` — the droneey structure of a system: its layers, dependency direction, ports and adapters, composition root and tree; `workflow` — how a change travels from the idea to the release: its branch, commit, review, version and release. Ask the owner which the repository follows. `foundation` is always followed; a team with its own architecture or its own workflow leaves that axis out. Write the answer as `axes`.


Read what tells you what the code is and where it runs: manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`…), lock files, tool configurations (`biome.json`, `tsconfig.json`, `lefthook.yml`, `.betterleaks.toml`…), the top-level folders, the CI workflows, and the README.

Propose, for each of the four keys, the blocks from the list above that the repository matches, each with the evidence that made you pick it:

```
implementations: biome — biome.json at the root and @biomejs/biome in devDependencies
```

- **domains** — the aspects the product has, whatever its technology: `ui` when it has screens, `version-control` when it lives in git.
- **platforms** — where the code runs; **languages** — what it is written in.
- **implementations** — the frameworks, libraries and tools it uses.

Then close the list over `Requires:`: every block a proposed block requires must be listed too — a domain a platform requires, such as `untrusted-client`, goes under `domains`. A block's `Extends:` base is abstract and comes with it without being listed, and the base's own `Requires:` count as the block's. An id that starts with `_` is an abstract base: it is never listed, and any block that extends it satisfies a requirement of it. Say which blocks you added this way and why.

The owner confirms or corrects each key. A block the owner drops is dropped; a block the owner adds must be one the list offers.

**A library with no block.** When the repository relies on a framework, library or tool the list does not offer, ask the owner which they want:

- **a local block** — you write `./rules/implementations/<id>.md` from `${CLAUDE_PLUGIN_ROOT}/templates/block.md`, and list its path under `implementations`;
- **nothing** — it is left out. Using a tool the constitution has no block for is not a departure.

For a local block, fill the template's placeholders from the repository and the owner:
- `id` is the file name without `.md`, and must not be an id from the list above;
- `summary` is one sentence of at most 70 characters, ending with a full stop;
- `requires` names the blocks it needs — constitution ids or other local blocks; `extends` names an abstract constitution base it inherits, an id that starts with `_`, or stays `null` — a constitution block it builds on goes under `requires`;
- `checks` lists the roles the tool checks, if it is a checking tool — the `role` lines of `${CLAUDE_PLUGIN_ROOT}/digests/index.tsv` hold them; `languages` the language blocks whose files those checks cover — constitution ids or local language blocks — and `[]` when it checks nothing or only the roles the index marks `true`, which hold for every language; `roles` stays `[]`, since only a language block is held to roles; `dictionary` its brand and file names; `governs` the file globs its rules govern;
- the **Requirements** table answers the requirements for implementation of the blocks above it — rules a domain, a platform or core asks of any library doing its job; read the files of the blocks it requires under `${CLAUDE_PLUGIN_ROOT}/blocks/` to find them. One row per requirement: its slug, how the library meets it, and whether it is met. `yes` — it meets the rule as written; `partly` — it meets the rule's purpose or part of its letter, and a rule of the local block covers the part it misses; `no` — it cannot meet the rule, and a rule of the local block replaces it. A `partly` or `no` row names that rule in How by its slug in backticks, and the rule is written with the owner as below. Drop the section when there is nothing to answer;
- a **rule** is written only when the owner states one, in the template's format, with a slug no `rule` line of the index holds. Drop the placeholder rule when there is none.

A local block is a draft until a person reviews it; say so.

### 4. Find the check command

`check` names the one command that runs every check of the repository — lint, types, tests. Look for it: a `check` script in the manifest, a task runner target (`make check`, `just check`, `task check`), or the steps CI runs. Propose what you found and where. If there is none, ask the owner which command it is; do not write a command the repository cannot run. A repository with no check at all writes `check: null`.

### 5. Ask about units

When the repository holds several units — the applications and packages of a workspace, the code they share, a server beside a web client — ask whether they follow different blocks. Top-level keys apply everywhere; a unit under `packages:` adds its own blocks for the files under its path, whether it sits in `packages/`, `shared/` or `libs/`:

```yaml
packages:
  packages/web:
    domains: [ui, untrusted-client, unreliable-network]
    platforms: [browser]
    implementations: [react-dom]
```

A path is relative to the root, two spaces in; its keys are `axes`, `domains`, `platforms`, `languages` and `implementations`, four spaces in, each a flow list. A unit's `axes` replace the repository's. Write `packages: {}` when there is one unit, or when they all follow the same blocks.

### 6. Interview for PROJECT.md

Ask one or two questions at a time, in the order of the sections of `${CLAUDE_PLUGIN_ROOT}/templates/PROJECT.md`, and use each answer to sharpen the next question. Where the repository already says something — a README, a package description — propose it and let the owner confirm or correct it.

- **One-liner.** In one sentence, what is this product and who is it for?
- **Context and users.** Who uses it, and what problem does it solve for them? Are there distinct roles?
- **Domains of the business.** What are the main areas of the product?
- **Core entities and relationships.** What are the main business objects, and how do they relate?
- **Boundaries.** What is out of scope — what will this product never do?
- **Critical scenarios.** Which journeys must never break — the ones a user would leave over? Each one gets an end-to-end test.
- **Glossary.** Which words does the business use, and what does each mean here?
- **Non-functional notes.** Any hard constraint on scale, offline use, devices, compliance, performance or the systems it depends on?

Use the owner's own words: the glossary seeds the language of the code. Keep it high-level — when an answer drifts into how a feature works or how to build it, keep its essence and steer back. What stays unanswered is left out: drop the section, and never write `TODO` or a promise about the future. A short file that is true beats a complete one that is not.

### 7. Overrides

`overrides` stays `[]`. When the owner names a rule the repository will not follow, do not write an override here: an override is recorded only through `/amend`, which asks for each of its fields and for the owner's consent to that override. Offer to run it once the files are written.

### 8. Summarise, then write

Show the owner everything you will write:
- `constitution.yaml` exactly as it will be written;
- `PROJECT.md` in full;
- each local block in full.

Then list every `partly` and `no` row of the Requirements tables of the blocks you propose — the plugin's, from their cards under `${CLAUDE_PLUGIN_ROOT}/blocks/`, and each local block's — each with the rule its How names: what the library cannot do, and the rule the project follows for it instead. These need no override, and you write none.

Write only after the owner's yes, and only the files the owner agreed to.

- **`constitution.yaml`** is `${CLAUDE_PLUGIN_ROOT}/templates/constitution.yaml` with `<installed version>` replaced by the installed version above and `<check command>` by the check command, and each `[]` or `{}` replaced where there is something to list. Keep every key, in the template's order. The hook reads a fixed subset of YAML: a list is a flow list `[a, b]` that may go on over indented lines until its `]`; a value holding `:` or `#` is double-quoted; there are no anchors, tags or multi-line strings.
- **`PROJECT.md`** keeps the template's title and blockquote as they are, then the sections that have content, without the template's `<!-- -->` guidance.

### 9. See what a session will receive

Run the hook as a session start would, from the repository root:

```bash
printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}\n' "$(pwd)" | CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}" bash "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"
```

It prints the digest as JSON. The digest's second line must say `constitution.yaml pins <version>; <n> blocks are active.`; a line that says the file does not parse names the line to fix. Each line under `⚠️ Warnings` says what is wrong and how to fix it: fix a mistake of yours in the file, and bring any other warning to the owner. Then tell the owner the files reach the main branch through a pull request like any change, and that the next session starts with the digest of these blocks.
