# constitution

The engineering constitution of droneey: the rules every repository is built by, split into **blocks**. A project lists the blocks it follows in one file, `constitution.yaml`, and describes itself in `PROJECT.md`; everything else lives here, versioned by tags.

The constitution is being rebuilt as v1.0 in seven steps, tracked in #50.

## 📦 Layout

| 📂 Path | 🧩 Holds |
|---|---|
| `blocks/core` | The laws for any program, always active |
| `blocks/domains/<id>` | An aspect a project has or has not, whatever its technology — `ui`, `api`, `version-control` |
| `blocks/contexts/platforms/<id>` | Where the code runs — `browser`, `mobile`, `cli`, `server` |
| `blocks/contexts/languages/<id>` | What it is written in — `typescript`, `python` |
| `blocks/implementations/<id>` | A framework, library or tool — `react-dom`, `bun`, `git` |
| `digests` | What the hook reads, generated from the blocks by `bun run digests:write` and committed: `index.tsv`, one record per role, block, rule and requirement answer, and `core.md`, core's part of the digest |
| `hooks` | `hooks.json`, which runs `session-start.sh` when a session starts, is cleared or compacted, and when a sub-agent starts; `lib/`, the awk programs it runs over the event, `constitution.yaml` and `digests/` |
| `.claude-plugin` | The plugin and marketplace manifests |
| `src` | The tooling that keeps the blocks sound |
| `DECISIONS.md` | The constitution's own decision log |

A block is a folder. Its main file `<id>.md` opens with a front matter that declares every field — `id`, `kind`, `summary`, `chapters`, `requires`, `extends`, `abstract`, `checks`, `owns`, `governs`, `status` — and then states its rules:

```markdown
## four-data-states · MUST
Every data view shows four states: loading, empty, error and content.
**Why:** an empty screen cannot otherwise be told from a slow one.
**Check:** test
**Tags:** ux, a11y
```

A block refers only to the layers above it, through its front matter. The rules at its seam with another block of its own layer or above live in its `with/<other>.md`. A brand, a language or a file form belongs to the block that `owns` it, and only that block and the blocks that depend on it may name it.

## 🧭 What a session receives

The hook finds the `constitution.yaml` of the repository a session works in and gives the agent one digest, within Claude Code's 10,000-character cap: the installed version and where the block files live, the warnings about the file, core's part, the active blocks by layer — each with its summary, its chapters and the `with/` files that apply — and each application's blocks under its path, the overrides, then MUST headlines while space lasts. The agent reads the block files the digest names. A sub-agent receives the same digest; a repository without `constitution.yaml` receives nothing. The hook runs on bash 3.2 and any POSIX awk, and reads nothing else in the project, so a project in any language can follow the constitution.

## 🔌 Install

The constitution is a Claude Code plugin served from this repository. Once per machine:

```bash
claude plugin marketplace add droneey/constitution
```

```bash
claude plugin install constitution@droneey
```

`claude plugin marketplace update` pulls a newer version.

## 🛠️ Development

```bash
mise trust && mise install   # bun
bun install                  # installs the git hooks
bun run check                # lint, package manifests, types, tests with the coverage gate, mutation, then the blocks check
bun run digests:write        # regenerate digests/ after a change to a block
```

The end-to-end spec in `src/testing/e2e` builds a plugin root from fixture blocks and runs the real hook over fixture projects; `HOOK_SHELL=/bin/bash bun test` runs it under the bash 3.2 macOS ships.

`blocks:check` loads every block and fails on:
- a file outside a block folder, a stray file inside one, or two blocks with one id;
- a front matter that lacks a field, adds one, lists them out of order, breaks a field's form, or fills one its layer leaves empty;
- a `requires` or `extends` that points down, or sideways where the layer allows no peer, a `with/` file named after a block below its own layer, and a cycle between implementations;
- a link or a rule slug that refers to another block anywhere but the front matter, a `with/` name or an Implements line;
- an abstract block without an heir, or one that names its heirs;
- an owned word outside its owner and the blocks that depend on it;
- a rule without a Why, a Check or a known tag, a slug used twice, and a heading or label that misses the rule format;
- a malformed Requirements row, an answer to a rule its block may not answer, or a Requirements table outside an implementation's main file and chapters;
- a file over 500 lines, and a link to a missing file;
- a broken plugin, marketplace or hooks manifest;
- a decision log that is missing, skips or repeats a number, or has an entry without its date and status;
- a `digests/` file that is missing or differs from its regeneration, a file there the generator does not write, and a core part of the digest over 3,500 bytes.

It checks the blocks across each other only once every block loads, so a broken block is reported once, not by every block that names it.

After the findings it prints advice that does not fail the check: the roles of tool-checked MUST rules that no tool checks for a language, and rules of sibling blocks similar enough to lift one layer up.

## ⚙️ Workflows

| 📄 File | ⚡ Trigger | 🎯 Does |
|---|---|---|
| `ci-check.yml` | pull request into `main` | Lint, types, tests with the hook under mawk and again under gawk, the blocks check, the workflow lint; on macOS, the hook under `/bin/bash` 3.2 and the system awk |
| `cd-version.yml` | push to `main` | Calls `droneey/.github`: bumps `package.json` from the merged branch prefix and pushes the `vX.Y.Z` tag |
| `cd-pre-release.yml` | tag `v*` | Calls `droneey/.github`: opens the pre-release with its changelog |

## 🛠️ Changing it

- Every change lands through a pull request into `main`, squash-merged, with its entry in `DECISIONS.md` when it is a decision.
- A file stays under 500 lines, and a block refers only to the layers above it.

## 📄 License

[PolyForm Internal Use 1.0.0](LICENSE.md): use it inside your own organisation, commercially or not; do not distribute, sublicense or sell it; keep the author's notice. Copyright Dmytro Kurovskyi.
