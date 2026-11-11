---
name: ratify
description: Put a repository under the Droneey Constitution — look at its code, propose the blocks it follows, and interview the owner, then write constitution.yaml, PROJECT.md and DECISIONS.md after the owner's yes. Use when the owner asks to ratify, adopt or set up the Constitution in a repository.
disable-model-invocation: true
---

# Ratify the Constitution in this repository

Installed Constitution plugin, which brings the hooks and these skills:

!`sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${CLAUDE_PLUGIN_ROOT}/package.json"`

The Constitution release installed in this project, in `.droneey/constitution/` — the rules come from it, never from the plugin:

!`sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${CLAUDE_PROJECT_DIR}/.droneey/constitution/package.json" 2>/dev/null || echo "(not installed)"`

Blocks it offers, by rank — `- <rank> <id>: <summary> Requires: <ids>.`:

!`cd "${CLAUDE_PROJECT_DIR}/.droneey/constitution" 2>/dev/null && find blocks -name '*.md' ! -path 'blocks/core/*' ! -path '*/@*' | awk -F/ '$NF == $(NF-1) ".md"' | LC_ALL=C sort | xargs awk 'FNR == 1 { split(FILENAME, p, "/"); rank = (p[2] == "contexts") ? p[3] : p[2]; sub(/s$/, "", rank) } /^id:/ { id = $2 } /^summary:/ { s = $0; sub(/^summary: *"?/, "", s); sub(/"$/, "", s) } /^requires:/ { r = $0; sub(/^requires: */, "", r); gsub(/[]["]/, "", r); gsub(/, */, " ", r); printf "- %s %s: %s Requires: %s.\n", rank, id, s, r }' | sed 's/ Requires: \.$//' || echo "(not installed)"`

The project folder holds:

!`ls -A "${CLAUDE_PROJECT_DIR}"`

## What you write

- **`constitution.yaml`** at the repository root: the blocks the repository follows, its packs and its overrides; in a workspace, one in each member's folder too. The hooks read them to give every agent the rules of those blocks, so a block listed by mistake costs every session, and one left out leaves its rules unenforced.
- **`PROJECT.md`** beside it: the product, its users, its subdomains by class, its entities, its boundaries, its critical scenarios and its glossary.
- **`DECISIONS.md`** beside them, when the repository has none: the strategic choices between real alternatives the owner names, each with what was rejected and why.
- **A block of the project's own pack** for each library the owner wants rules for and the release has no block for.
- **Each tool's configuration**, which `constitution presets apply` writes from the presets of the release and the packs. With `constitution.yaml` already in place, offer to go straight to step 9.

The repository root is the folder, going up from the project folder, that holds `.git`. Core is always active and is never listed.

## How to run it

Propose, let the owner confirm or correct, then move on. Never invent an answer: a wrong block, command or sentence written with confidence is worse than a gap the owner can see.

### 1. Check what is there

If the release above reads `(not installed)`, propose to install it first: in `mise.toml`, the tool `github:droneey/constitution` at the plugin's version, with the release's distribution for each platform, and the `postinstall` hooks that link it:

```toml
[tools."github:droneey/constitution"]
version = "<plugin version>"
strip_components = 0
bin_path = "bin"

[tools."github:droneey/constitution".platforms]
linux-x64 = { asset_pattern = "constitution-linux-x64.tar.gz" }
linux-arm64 = { asset_pattern = "constitution-linux-arm64.tar.gz" }
macos-x64 = { asset_pattern = "constitution-macos-x64.tar.gz" }
macos-arm64 = { asset_pattern = "constitution-macos-arm64.tar.gz" }

[hooks]
postinstall = [
  "mkdir -p .droneey",
  "ln -sfn \"$(mise where github:droneey/constitution)\" .droneey/constitution",
]
```

and `/.droneey` in `.gitignore`. After the owner's yes, write them, run `mise install`, and ask the owner to run `/constitution:ratify` again, which then reads the release's blocks. Stop here until then.

If `constitution.yaml`, `PROJECT.md` or `DECISIONS.md` is already at the root, say so and ask whether to replace it. If decisions are kept elsewhere, such as `docs/adr/`, ask whether to move them into `DECISIONS.md` or to leave them and write none. With a no, leave that file alone. Either way, build the proposal from the repository and the owner, not from the files already there.

### 2. Show what the release offers

Tell the owner the installed release and its blocks, grouped by rank, in a few lines. A block's id is its path within its rank, such as `react/react-dom` or `client/browser`. When the repository links packs, folders of blocks beside the release such as `.droneey/constitution-extra`, list their paths under `packs:` and offer their blocks too.

### 3. Ask for the axes, then propose the blocks

Every block holds its rules on three axes: `@foundation/`, which every project follows, and two optional ones: `@architecture/`, the Droneey structure of a system (its layers, the direction of its dependencies, its ports and adapters, its composition root and its tree), and `@workflow/`, how a change travels from the idea to the release (branch, commit, review, version and release). Ask which of the two the repository follows; a team with its own architecture or workflow leaves that axis out. Write the answer as `axes`: `[architecture, workflow]`, one of them, or `[]`.

Read what tells you what the code is and where it runs: the manifests and lock files, the tools' configurations, the top-level folders, the CI workflows and the README. Propose, for each of the four keys, the blocks from the list above that the repository matches, each with its evidence:

```text
implementations: biome — biome.json at the root and @biomejs/biome in devDependencies
```

- **domains**: the aspects the product has, whatever its technology, such as `presentation` when it has screens and `version-control` when it lives in git;
- **platforms**: where the code runs, such as `client/browser` or `server`;
- **languages**: what it is written in, and the formats of the files it keeps, such as JSON, YAML or a Dockerfile;
- **implementations**: the frameworks, libraries and tools it uses.

A listed block brings every block whose folder holds it, so `react/react-dom` brings `react`, which then needs no line of its own. Then close the list over `Requires:`: every block a proposed block requires is listed too, under the key of its rank, or one of its child blocks is, which brings it. Say which blocks you added this way and why. The owner confirms or corrects each key; a block the owner adds must be one the list offers.

**A library with no block.** Ask the owner whether to write a block of the project's own pack for it, or to leave it out; using a tool the Constitution has no block for is no departure. For a block of the pack, `pack/` unless the owner names another folder:

- copy `.droneey/constitution/templates/block/` to `<pack>/blocks/implementations/<id>/`, rename `block.md` to `<id>.md` and `@foundation/chapter.md` after the subject of its rules, such as `@foundation/retries.md`, never `<id>.md`; copy `.droneey/constitution/templates/DECISIONS.md` to `<pack>/DECISIONS.md` when the pack has none;
- `id` is its folder's name, and no block of the list above holds it;
- `summary` is one sentence of at most 70 characters, ending with a full stop;
- `requires` names only the blocks it cannot work without, as core's `passport-requires-only-what-its-block-needs` asks;
- `languages` lists, for a tool, the language blocks whose files its presets cover, and stays `[]` otherwise; `governs` lists the globs of the files its rules govern, its configuration files among them;
- the passport's line says in plain words what the library is, and its setup paragraph what its preset entries cannot show, such as how the library is set up or a quirk of the tool; drop the paragraph when there is nothing to say. A passport defines no term;
- a rule is written only when the owner states one, in the chapter template's form and worded as the `Wording` rules of core's `placement` chapter ask, with a slug no rule of the release holds. Drop the chapter and its `@foundation/` folder when there is none;
- a term two or more rules use is defined in bold in a `## Vocabulary` section before `## General`, a folder or a suffix with an id right after its bold, ``**`project.inlang/`**{#translation-project}``; a term one rule needs is stated in that rule, without bold, as `rule-term-defined-in-a-vocabulary` asks.

`constitution run check` checks the pack's blocks first, in its Packs step.

A block of the project's own pack is a draft until a person reviews it; say so.

### 4. Find the runner and the project's own checks

The one check is `constitution run check`: in each unit it runs the `check` its runner block gives, `bun run check` for `js-runtime/bun` and `poe check` for `task-runner/poe`, which runs every `check:<what>` script the tools' blocks write. Propose the runner each unit uses. Look for checks the repository runs that no block writes, such as a script in the manifest or a step of CI, and propose each under a name of the same form, `check:<what>`, so the runner's `check` takes it.

### 5. Ask about units

In a workspace, each member its manifests declare keeps a `constitution.yaml` of its own in its folder: the folders that `workspaces` of the root's `package.json` and `members` of uv's workspace in the root's `pyproject.toml` name. Nothing passes from the root's file to a member's: ask which axes, blocks and packs each member follows, and write them in its own file, a pack listed by its path from the member's folder:

```yaml
name: '@acme/web'
axes:
  - architecture
  - workflow
domains:
  - presentation
  - version-control
platforms:
  - client/browser
languages:
  - typescript
  - html
implementations:
  - react/react-dom
  - js-runtime/bun
  - task-runner
  - biome
  - git
packs: []
overrides: []
```

Every file names its unit's package in `name`, as its manifest gives it: `name` of its `package.json`, or `name` under `[project]` of its `pyproject.toml`; ask the owner for a unit whose manifest gives none. A unit that needs a setting its blocks do not give keeps it in its own pack, `<unit>/pack/`, under `presets/` laid out as the release's.

### 6. Interview for PROJECT.md

Ask one or two questions at a time, in the order of the sections of `.droneey/constitution/templates/PROJECT.md`. Where the repository already says something, such as in its README, propose it and let the owner correct it.

- **One-liner.** In one sentence, what is this product and who is it for?
- **Context and users.** Who uses it, what problem does it solve for them, and are there distinct roles?
- **Subdomains.** What are the areas of the business? Which is the core domain, the reason the product exists, and is each other one supporting or generic? Which features serve each?
- **Core entities and relationships.** What are the main business objects, and how do they relate?
- **Boundaries.** What will this product never do?
- **Critical scenarios.** Which journeys must never break? Each one gets an end-to-end spec.
- **Glossary.** Which words does the business use, and what does each mean here?
- **Non-functional notes.** Any hard constraint on scale, offline use, devices, compliance, performance or the systems it depends on?
- **Decisions.** Which strategic choices between real alternatives has the project made, such as its store, its framework or its architecture, what was turned down, and why? These go into `DECISIONS.md`, not `PROJECT.md`.

Use the owner's words: the glossary seeds the language of the code. When an answer drifts into how a feature works, keep its essence and steer back. Leave out what stays unanswered: drop the section, and never write `TODO`.

### 7. Overrides

`overrides` stays `[]`. When the owner names a rule the repository will not follow, offer `/constitution:amend` once the files are written: it asks for each field of an override and for the owner's consent to it.

### 8. Summarise, then write

Show the owner everything you will write: each `constitution.yaml` exactly as written, `PROJECT.md` and `DECISIONS.md` in full, and each block of the pack in full. Write only after the owner's yes, and only the files the owner agreed to.

- **`constitution.yaml`** is `.droneey/constitution/templates/constitution.yaml` with `<name>` filled in and each `[]` that has something to list. Keep every key, in the template's order, and write each list as a block list, `[]` only when it is empty. Quote a value that holds `:` or `#` or opens with `@`; write no anchor, tag or multi-line string, which the hooks refuse.
- **`PROJECT.md`** keeps the template's title and quote, then the sections that have content, without the `<!-- -->` guidance.
- **`DECISIONS.md`** is `.droneey/constitution/templates/DECISIONS.md`, its title, its quote and the entry form in its comment kept, with the owner's choices as its entries.

### 9. Write the tools' configurations

Once every `constitution.yaml` is written, run from the repository root:

```bash
constitution presets plan
```

It prints each file the active blocks give, with the preset entries that write into it, and what it finds wrong. Ask the owner for what only they know, such as a unit with no `name`, and write it where the plan says. Then run:

```bash
constitution presets apply
```

It writes every unit's files beside the settings each file holds of its own, removes what an earlier apply wrote that no entry gives any longer, writes each unit's `constitution.lock`, and then runs the fix of each unit it wrote a file of. Show the owner the diff and every finding. A finding is fixed in the code, or offered as an override through `/constitution:amend`; a written setting is never edited back by hand, which the next check reports. Then run `constitution run check`.

### 10. See what a session will receive

Run the hook as a session start would, from the repository root:

```bash
printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}\n' "$(pwd)" | constitution hook session-start
```

It prints the digest as JSON. Its `## Active blocks` map lists the blocks of each rank and each member's changes; a line saying `constitution.yaml does not parse` names the line to fix. Fix each line under `⚠️ Warnings` that is your mistake, and bring the others to the owner. Then tell the owner the files reach the main branch through a pull request like any change.
