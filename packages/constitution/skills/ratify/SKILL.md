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

Blocks it offers, by layer — `- <layer> <id>: <summary> Requires: <ids>. Extends: <base>.`:

!`cd "${CLAUDE_PROJECT_DIR}/.droneey/constitution" 2>/dev/null && find blocks -path blocks/core -prune -o -name '*.md' -print | awk -F/ '$NF == $(NF-1) ".md"' | LC_ALL=C sort | xargs awk 'FNR == 1 { n = split(FILENAME, p, "/"); layer = (p[2] == "contexts") ? p[3] : p[2]; sub(/s$/, "", layer) } /^summary:/ { s = $0; sub(/^summary: *"?/, "", s); sub(/"$/, "", s) } /^requires:/ { r = $0; sub(/^requires: */, "", r); gsub(/[]["]/, "", r); gsub(/, */, " ", r) } /^extends:/ { e = $0; sub(/^extends: */, "", e); if (e == "null") e = ""; printf "- %s %s: %s Requires: %s. Extends: %s.\n", layer, p[n - 1], s, r, e }' | sed -e 's/ Requires: \.//' -e 's/ Extends: \.$//' || echo "(not installed)"`

The project folder holds:

!`ls -A "${CLAUDE_PROJECT_DIR}"`

## What you write

- **`constitution.yaml`** at the repository root: the blocks the repository follows, the one command that runs its checks, and its overrides; and in a workspace one in each member's folder, with the blocks that member follows. The session-start hook reads them and gives every agent the rules of those blocks, so a block listed by mistake costs every session, and a block left out leaves its rules unenforced.
- **`PROJECT.md`** beside it: what the product is, for whom, the domains of its business, its entities, its boundaries, its critical scenarios and its glossary. It gives any agent the context of the whole, so a change fits the product and not just the task.
- **`DECISIONS.md`** beside them, from the template, when the repository has none: the log where every later choice between real alternatives is recorded with what was rejected and why. Any choice the owner names during the interview — a store, a framework, a boundary — goes in as its first entries.
- **A block of the project's own pack** for each library the owner wants rules for that the plugin has no block for: a folder of blocks shaped like the Constitution — `constitution/` unless the owner names another — listed under `packs:`.
- **Each tool's configuration**, wired with the parts of the presets its unit's blocks take, from the fragments the active blocks keep in `.droneey/constitution/templates/project/`. The session-start hook warns of a configuration that lacks a part or keeps one its blocks no longer take, so a project whose blocks or release changed runs this skill again to bring them up to date; with `constitution.yaml` already in place, offer to go straight to step 9.

The repository root is the folder, going up from the project folder, that holds `.git`. Core is always active and is never listed.

## How to run it

Work in this order, and keep the owner in the loop: propose, let them confirm or correct, move on. Never invent an answer — a wrong block, command or sentence written with confidence is worse than a gap the owner can see.

### 1. Check what is there

If the release above reads `(not installed)`, or the block list does, the project has no Constitution to read yet. Propose to install it first: in `mise.toml`, the tool `github:droneey/constitution` with the release's archive and, for each platform, its `constitution` program, which the hooks run, and the `postinstall` hooks that link the release, with the installed plugin's version above:

```toml
[tools."github:droneey/constitution"]
version = "<plugin version>"
asset_pattern = "constitution.tar.gz"
strip_components = 0
bin_path = "bin"

[tools."github:droneey/constitution".platforms]
linux-x64 = { additional_asset_patterns = ["constitution-linux-x64.tar.gz"] }
linux-arm64 = { additional_asset_patterns = ["constitution-linux-arm64.tar.gz"] }
macos-x64 = { additional_asset_patterns = ["constitution-macos-x64.tar.gz"] }
macos-arm64 = { additional_asset_patterns = ["constitution-macos-arm64.tar.gz"] }
windows-x64 = { additional_asset_patterns = ["constitution-windows-x64.tar.gz"] }

[hooks]
postinstall = [
  "mkdir -p .droneey",
  "ln -sfn \"$(mise where github:droneey/constitution)\" .droneey/constitution",
]
```

and `/.droneey` in `.gitignore`. After the owner's yes, write them, run `mise install`, and ask the owner to run `/constitution:ratify` again, which then reads the release's blocks. Stop here until then.

If `constitution.yaml`, `PROJECT.md` or `DECISIONS.md` is already at the root, say so and ask whether to replace it. If decisions are kept elsewhere — `docs/adr/`, `docs/decisions/` — say so and ask whether to move them into `DECISIONS.md` or leave them and write none. With a no, leave that file alone: do not write it and skip its part of the work. Either way, build the proposal from the repository and the owner, not from files already there.

### 2. Show what the plugin offers

Tell the owner the installed release and the blocks above, grouped by layer, in a few lines. If the list is empty, the release offers no blocks: every layer key stays `[]`, and only the blocks of packs can be listed. When the repository links packs — folders of blocks beside the Constitution, such as `.droneey/constitution-extra` — list their paths under `packs:` and offer their blocks with the others, by id; `packs: []` stays when there are none.

### 3. Ask for the axes, then look at the repository and propose the blocks

Every block holds its rules on three axes, a folder each: `foundation` — what holds for any team, always followed — and two optional ones: `architecture` — the Droneey structure of a system: its layers, dependency direction, ports and adapters, composition root and tree; `workflow` — how a change travels from the idea to the release: its branch, commit, review, version and release. Ask the owner which of the two the repository follows; a team with its own architecture or its own workflow leaves that axis out. Write the answer as `axes`: `[architecture, workflow]`, one of them, or `[]`.

Read what tells you what the code is and where it runs: manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`…), lock files, tool configurations (`biome.json`, `tsconfig.json`, `lefthook.yml`, `.betterleaks.toml`…), the top-level folders, the CI workflows, and the README.

Propose, for each of the four keys, the blocks from the list above that the repository matches, each with the evidence that made you pick it:

```text
implementations: biome — biome.json at the root and @biomejs/biome in devDependencies
```

- **domains** — the aspects the product has, whatever its technology: `ui` when it has screens, `version-control` when it lives in git.
- **platforms** — where the code runs; **languages** — what it is written in, and the formats of the files it keeps: JSON, TOML, YAML, HTML, a Dockerfile.
- **implementations** — the frameworks, libraries and tools it uses.

Then close the list over `Requires:`: every block a proposed block requires must be listed too — a domain a platform requires, such as `untrusted-client`, goes under `domains`. A block's `Extends:` base is abstract and comes with it without being listed, and the base's own `Requires:` count as the block's. An id that starts with `_` is an abstract base: it is never listed, and any block that extends it satisfies a requirement of it. Say which blocks you added this way and why.

The owner confirms or corrects each key. A block the owner drops is dropped; a block the owner adds must be one the list offers.

**A library with no block.** When the repository relies on a framework, library or tool the list does not offer, ask the owner which they want:

- **a block of the project's own pack** — you copy `.droneey/constitution/templates/block/` to `<pack>/blocks/implementations/<id>/`, rename its passport `block.md` to `<id>.md` and `foundation/chapter.md` to the subject of its rules — `foundation/retries.md`, named in the block's own terms, never `<id>.md` —, list the pack's folder under `packs:` and the block's id under `implementations`;
- **nothing** — it is left out. Using a tool the Constitution has no block for is not a departure.

For a block of the project's own pack, fill the template's placeholders from the repository and the owner:

- `id` is its folder's name and its file's name without `.md`, and must not be an id from the list above;
- `summary` is one sentence of at most 70 characters, ending with a full stop;
- `requires` names the blocks it needs — Constitution ids or other blocks of the pack —, the language of each configuration file it governs among them, unless a block it requires brings it; `extends` names an abstract Constitution base it inherits, an id that starts with `_`, or stays `null` — a Constitution block it builds on goes under `requires`;
- `languages` lists, for a tool, the language blocks whose files its presets cover — Constitution ids or language blocks of the pack — and stays `[]` for a tool that covers no language's files and for a library; `governs` the file globs its rules govern, its configuration files among them — a language block governs only its files' extensions;
- the passport's line of what the block is names the library in bold, `> **Paraglide** compiles …`, which defines it as the block's term, and each file, command or API the block owns is set in bold once, as a code span, where the passport first names it; a folder, which ends in `/`, or a suffix, which starts with `.`, carries right after its bold an id that names what it holds, in lower-case words joined by hyphens and unique across the blocks: ``**`project.inlang/`**{#translation-project}``; every other mention is plain;
- the passport's **setup** paragraph says what the block's parts and templates cannot show — how the library is set up, a quirk of the tool, a limit of what it holds; drop it when there is nothing to say;
- the passport's **Requirements** table answers the requirements for implementation of the blocks above it — rules a domain, a platform or core asks of any library doing its job; read the files of the blocks it requires under `.droneey/constitution/blocks/` to find them. One row per requirement: its slug, how the library meets it, and whether it is met. `yes` — it meets the rule as written; `partly` — it meets the rule's purpose or part of its letter, and a rule of the block covers the part it misses; `no` — it cannot meet the rule, and a rule of the block replaces it. A `partly` or `no` row names that rule in How by its slug in backticks, and the rule is written with the owner as below. Drop the section when there is nothing to answer;
- a **rule** is written only when the owner states one, in the chapter template's format, with a slug no rule heading of the Constitution's blocks holds. Drop the chapter, and its `foundation/` folder, when there is none.

A block of the project's own pack is a draft until a person reviews it; say so.

### 4. Find the check command

`check` names the one command that runs every check of the repository — lint, types, tests. Look for it: a `check` script in the manifest, a task runner target (`make check`, `just check`, `task check`), or the steps CI runs. Propose what you found and where. If there is none, ask the owner which command it is; do not write a command the repository cannot run. A repository with no check at all writes `check: null`.

### 5. Ask about units

When the repository is a workspace — apps, the packages they share or the repository releases, a server beside a web client — each member its manifests declare keeps a `constitution.yaml` of its own in its folder: the members are the folders that `workspaces` of the root's `package.json` and `members` of uv's workspace in the root's `pyproject.toml` name. Nothing passes from the root's file to a member's: ask which blocks, axes and packs each member follows, propose for each the root's blocks that hold its files too, and write them in its own file. A member's file takes every key of the root's but `check`, which only the root names, and lists a pack by its path from the member's folder:

```yaml
name: '@acme/web'
axes:
  - architecture
  - workflow
domains:
  - ui
  - untrusted-client
  - version-control
platforms:
  - browser
languages:
  - typescript
  - html
implementations:
  - react-dom
  - biome
  - git
packs: []
overrides: []
```

Every file, the root's and each member's, names its unit's package in `name`, as the unit's manifest gives it: `name` of its `package.json`, or `name` under `[project]` of its `pyproject.toml`. Propose each from there, and ask the owner for the name of a unit whose manifest gives none.

A member with no `constitution.yaml`, and a folder that keeps a tool's configuration of its own but is no member, are warnings of the digest.

### 6. Interview for PROJECT.md

Ask one or two questions at a time, in the order of the sections of `.droneey/constitution/templates/PROJECT.md`, and use each answer to sharpen the next question. Where the repository already says something — a README, a package description — propose it and let the owner confirm or correct it.

- **One-liner.** In one sentence, what is this product and who is it for?
- **Context and users.** Who uses it, and what problem does it solve for them? Are there distinct roles?
- **Domains of the business.** What are the main areas of the product?
- **Core entities and relationships.** What are the main business objects, and how do they relate?
- **Boundaries.** What is out of scope — what will this product never do?
- **Critical scenarios.** Which journeys must never break — the ones a user would leave over? Each one gets an end-to-end test.
- **Glossary.** Which words does the business use, and what does each mean here?
- **Non-functional notes.** Any hard constraint on scale, offline use, devices, compliance, performance or the systems it depends on?
- **Decisions.** Which choices between real alternatives has the project already made — a store, a framework, a boundary — what was turned down, and why? These become the first entries of `DECISIONS.md`, not part of `PROJECT.md`.

Use the owner's own words: the glossary seeds the language of the code. Keep it high-level — when an answer drifts into how a feature works or how to build it, keep its essence and steer back. What stays unanswered is left out: drop the section, and never write `TODO` or a promise about the future. A short file that is true beats a complete one that is not.

### 7. Overrides

`overrides` stays `[]`. When the owner names a rule the repository will not follow, do not write an override here: an override is recorded only through `/amend`, which asks for each of its fields and for the owner's consent to that override. Offer to run it once the files are written.

### 8. Summarise, then write

Show the owner everything you will write:

- `constitution.yaml` exactly as it will be written, the root's and each member's;
- `PROJECT.md` in full;
- `DECISIONS.md` in full, when it will be written;
- each block of the project's own pack in full.

Then list every `partly` and `no` row of the Requirements tables of the blocks you propose — the release's, from the chapters of their axes under `.droneey/constitution/blocks/`, and each block of the project's own pack — each with the rule its How names: what the library cannot do, and the rule the project follows for it instead. These need no override, and you write none.

Write only after the owner's yes, and only the files the owner agreed to.

- **`constitution.yaml`** is `.droneey/constitution/templates/constitution.yaml` with `<name>` replaced by the unit's name, `<check command>` by the check command, and each `[]` where there is something to list; a member's is the same without its `check` line. Keep every key, in the template's order. Write every list as a block list, an item to a line, `[]` only when it is empty, as yamllint's preset asks. The hook reads a fixed subset of YAML: a block list, or a flow list `[a, b]`; a value holding `:` or `#`, or opening with `@`, is quoted, in single quotes unless it holds one; there are no anchors, tags or multi-line strings.
- **`PROJECT.md`** keeps the template's title and blockquote as they are, then the sections that have content, without the template's `<!-- -->` guidance.
- **`DECISIONS.md`** is `.droneey/constitution/templates/DECISIONS.md`, keeping its title, its blockquote and the `<!-- -->` entry format later entries copy, with the owner's choices as its entries; written only when the repository has none.

### 9. Wire the tools' configurations

Once every `constitution.yaml` is written, run, from the repository root:

```bash
constitution presets plan
```

It prints each file the active blocks give — `<path> for <units>`, `(new)` where the folder holds none yet — with the units it serves, `.` for the repository: for a tool no member follows, the root's file serves every unit; for any other tool, each unit's own file serves that unit alone, and a template that takes no part is read from the nearest folder at or above the unit that keeps the file. Under the file come the fragment of each block, `.droneey/constitution/templates/project/<scope>/<block>/<path>`, and under a tool's fragment the parts it takes, in order. Each package keeps its tools' configurations in its own folder; the root of a workspace keeps the tools that run once for the whole repository — the commit hooks, the secrets scan, the manifests' check, a scan of every lockfile — and, of each other tool, only its own part and its workspace part. Keep the repository's layout where it already follows this: update each file that exists, and write a new one where its package needs it. A tool that takes no part on the axes its unit follows gets no file. Ask the owner for what only they know: `<name>`, the project's name; `<package>`, the import package of its Python code; the paths a task of `mise.toml` names, such as a Dockerfile or a Compose file, which you propose from the repository. Write each file from it:

- **Assemble** the file from its fragments, one after the other in the order printed, each under its block's line as the fragment writes it. In a structured file — JSON, TOML, YAML, code — merge each fragment's table, list or script into the file's own: a list the fragments share, such as `extends` of `biome.json` or `preload` of `bunfig.toml`, holds the entries of each fragment in the order printed, without repeats; a table, such as `[dependency-groups]`, `devDependencies`, `scripts` or `[tool.poe.tasks]`, holds the keys of every fragment. A `check` script or task runs, in the order printed, the `test` one and every `*:check` one the fragments give, never a `*:fix` or a `*:all` one. A fragment marked `(the folder adds it)` is the only one a file the tool also reads from the folders above, as git reads `.gitignore`, takes there; every other file takes all its fragments. In a workspace, a table that a rule gives to the root alone, such as `[install]` of `bunfig.toml`, goes only into the root's file.
- **Fill** the placeholders: `<presets>` becomes the path from the file to the release's `presets` folder, starting with `./` or `../`; `<parts>` becomes the printed parts, each by its path relative to the file and starting with `./` or `../` — one entry each in a list; in code one import each, named in camelCase after the part, with its axis before it off `foundation` (`architectureCore`), and `part` in the template's body stands for the whole list, in order, so a configuration that joins its parts is only their imports and one `join(…)` with the project's own settings last. `<unit folders>` becomes, at the root of a workspace, one entry for each folder its members lie in, as the root's `workspaces` globs and uv's `members` name them (`apps`, `packages`), and is left out with its entry everywhere else; `<chain end>` becomes the printed part none of the others extends, which a part's own `extend` or `extends` line shows; `<copied parts>`, between `# from <parts>` and `# end <parts>`, one pair to a part — its line `# from <path>`, its content unchanged save `<package>`, which becomes the unit's import package, its line `# end <path>` — with the project's own settings outside the pairs. Biome reaches the parts of a package through a `.droneey/constitution` link in the package's folder to the root's: create it when it is missing.
- **Keep the project's own settings.** When the file exists, keep every setting of its own after the parts and change only how it takes them; when a part now holds a setting the file repeats, drop the repetition, save a setting a block's fragment writes, and say so.
- **A tool with no template** — a line `no template: <scope>/<tool>` — is a pack's tool: wire its parts in `<pack>/presets/<scope>/<tool>/` from what you know of the tool, and say that no template guided it.

Show the owner the diff of every file you will write, write only after the owner's yes, and run the check command when it exists; a finding a newly taken part raises is the code's or the part's to fix, never a reason to leave the part out — an override lowers a rule only through `/amend`.

### 10. See what a session will receive

Run the hook as a session start would, from the repository root:

```bash
printf '{"cwd":"%s","hook_event_name":"SessionStart","source":"startup"}\n' "$(pwd)" | constitution hook session-start
```

It prints the digest as JSON. The digest's second line must say `constitution.yaml makes <n> blocks active.`; a line that says the file does not parse names the line to fix. Each line under `⚠️ Warnings` says what is wrong and how to fix it: fix a mistake of yours in the files, a `wiring` warning included, and bring any other warning to the owner. Then tell the owner the files reach the main branch through a pull request like any change, and that the next session starts with the digest of these blocks.
