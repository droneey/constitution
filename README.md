# constitution

The engineering constitution of droneey: the rules every repository is built by, split into **blocks**. A project lists the blocks it follows in one file, `constitution.yaml`, and describes itself in `PROJECT.md`; everything else lives here, versioned by tags.

The constitution is being rebuilt as v1.0 in seven steps, tracked in #50.

## 📦 Layout

| 📂 Path | 🧩 Holds |
|---|---|
| `blocks/core` | What holds for any program, always active: its card `core.md`, how to use the constitution, which holds no rule; its chapters at its root and in `architecture/` and `workflow/`, each named for what its rules govern |
| `blocks/domains/<id>` | An aspect a project has or has not, whatever its technology — `ui`, `remote-data`, `version-control` |
| `blocks/contexts/platforms/<id>` | Where the code runs — `browser`, `mobile`, `cli` |
| `blocks/contexts/languages/<id>` | What it is written in — `typescript`, `css`, `python` |
| `blocks/implementations/<id>` | A framework, library or tool — `react-dom`, `bun`, `git` |
| `digests` | What the hook reads, generated from the blocks by `bun run digests:write` and committed: `index.tsv`, one record per block — with the languages its presets cover — rule and requirement answer, and `core.md`, core's part of the digest |
| `hooks` | `hooks.json` and its scripts: `session-start.sh` gives the digest when a session starts, is cleared or compacted, and when a sub-agent starts; `post-tool-use.sh` names the blocks that govern a file the agent touches; `user-prompt-submit.sh` and `record-check.sh` note the tree when a prompt arrives and when the check passes; `stop.sh` is the hand-back gate; `lib/`, the awk programs and `state.sh` they share |
| `skills` | `/ratify` and `/amend`, which write a project's files, and `/check`, which reviews its changes |
| `agents` | `reviewer`, which `/check` asks to judge files against the rules that govern them |
| `presets` | The tool configurations that hold rules, `presets/<scope>/<tool>/<block>.*` for the base and `presets/<scope>/<tool>/<axis>/<block>.*` for an optional axis, and beside each axis's parts the bindings that say which setting holds which rule |
| `templates` | What `/ratify` writes from: `constitution.yaml`, `PROJECT.md`, and `block.md` for a local block; `project/<block>/`, a project's starter files |
| `tools` | Programs the release archive carries: `mutation-check`, which mutates only the lines a change touches; for Python, `mutmut-check`, its twin over mutmut, and `python-check`, which holds the lengths of functions and files, where a relative import may reach and where a package may be imported — each a member of the repository's uv workspace with its own specs |
| `.claude-plugin` | The plugin and marketplace manifests |
| `src` | The tooling that keeps the blocks sound |
| `DECISIONS.md` | The constitution's own decision log |
| `vocabulary.yaml` | The words of one meaning the `architecture` and `workflow` axes own — terms, folders of the tree, role suffixes, branch prefixes |
| `.claude/agents/rule-placement.md` | The agent that judges, by meaning, the layer and axis of every rule a change adds or rewrites |

A block is a folder. Its card `<id>.md` opens with a front matter that declares every field — `id`, `summary`, `requires`, `extends`, `abstract`, `languages`, `dictionary`, `governs` — and then its summary; its layer is its folder. Its rules sit on three axes. The base, what any team wants, is always followed and sits at the block's root: the card itself holds the rules of its main chapter, after the summary, beside the base's other chapters, one topic each, and its seams in `with/`. The two optional axes keep a folder each: `architecture/` the structure of a system — its layers, the direction of its dependencies, its ports and adapters, its composition root and its tree — and `workflow/` how a change travels from the idea to the release; each holds its chapters — `<id>.md` and any other file — and its seams in `with/`. A project lists in `constitution.yaml` the optional axes it follows; a team with its own architecture or workflow leaves that axis out. A chapter is named for what its rules govern — `functions`, `errors`, `dependencies` — and a rule's statement opens with that thing, so the first words of a rule tell its chapter; core's `code` takes only a rule no other chapter names. A rule is a third-level heading in one of these files, its statement, and a table of its Why and its Tags; a second-level heading opens a section that groups rules, and is no rule:

```markdown
### data-states-shown · MUST
Every data view shows loading, error and content, and the empty or not-found state its data can have.

| Why | Tags |
|---|---|
| an empty screen cannot otherwise be told from a slow one. | [ux, a11y] |
```

A rule that carries out another names it with an arrow beside its own level, and takes its tags from it: `### query-result-returned-as-status-union → data-result-is-union-by-status · MUST`. Its level is never looser than the rule it carries out, and an override lowers the one rule it names. A rule carries out one rule at most, and only a rule of another block — never one of its own, in any of its files or seams.

The levels mean what [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) give them, in capitals only. A rule's level is MUST where a violation is plainly wrong and answered yes or no, most often by a tool, and SHOULD where it takes judgement or has reasonable exceptions; MAY marks a permitted choice. A MUST binds until an override lowers it; a SHOULD may be left with a stated reason. The reminders name a file's MUST rules, and only MUST rules raise the hook's warnings.

A tool's block lists in `languages` the language blocks whose files its presets cover, whatever it requires: Biome requires `typescript` and covers `typescript` and `css`. They decide the scopes its parts may sit in; every other block leaves the field empty. Which tool holds which rule, wholly or in part, only the presets say, in their `bindings.yaml`; a rule never names the tool or the kind of tool that holds it.

A rule's Tags are lenses for the concerns that cross every axis and layer — `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux` — so a review can take one concern across the whole project. They are optional: a full review reads every rule, and a rule inherits the tags of the rule it carries out.

A domain, a platform or core may list, under a chapter's heading `Requirements for implementation`, the rules it asks of any library that does its job. An implementation's card answers those of the blocks above it in a Requirements table, one row each: the rule, how the library meets it, and whether it does. `yes` — it meets the rule as written; `partly` — it meets the rule's purpose or part of its letter, and a rule of the answering block covers the part it misses; `no` — it cannot meet the rule, and a rule of the answering block replaces it. A `partly` or `no` row names that rule in its How by its slug in backticks, so a project that takes the block follows the rule instead, with no override.

A block refers, through its front matter, only to the layers above it and, among implementations, to the host it requires and the abstract base it extends. The rules at its seam with another block of its own layer or above live in its `with/<other>.md`, or `<axis>/with/<other>.md` on an optional axis. A brand, a language or a file form belongs to the block whose `dictionary` holds it, and only that block and the blocks that depend on it may name it.

## 🧰 Presets

A project takes its tool configurations from the release archive, `constitution.tar.gz`, which mise installs pinned by version and links as `.droneey/constitution/`. It holds `presets/`, `templates/` and the built `tools/`. A preset is split into parts, `presets/<scope>/<tool>/<block>.*` for the base and `presets/<scope>/<tool>/<axis>/<block>.*` for an optional axis:
- the scope is the files the part reads: `common` for any language, or a language block — `typescript`, `css`, `python` — for that language's files alone; a tool lists the languages it covers in its block's `languages`, and a project takes the scopes of its active languages;
- the tool folder is the tool's block — `biome`, `dependency-cruiser`, `ls-lint`, `tsc` for the compiler;
- a part of the base sits at the tool's root, and a part of an optional axis in `architecture/` or `workflow/`, the axis whose rules it holds, so a project that leaves an axis out leaves out its parts;
- a part is named after the block its settings need, the one without which they mean nothing: `noTailwindArbitraryValue` sits in `tailwind`, though the rule it holds is `ui`'s; settings that need no block beyond the tool sit in `core` when they hold a rule of core and in `self` when they are the tool's own; GritQL rules are `plugins/<rule-slug>.grit` beside the parts of their axis.

A project's configuration extends the parts of its active blocks on its axes, the base first:

```json
{
  "extends": [
    "./.droneey/constitution/presets/common/biome/self.jsonc",
    "./.droneey/constitution/presets/typescript/biome/typescript.jsonc",
    "./.droneey/constitution/presets/typescript/biome/self.jsonc",
    "./.droneey/constitution/presets/typescript/biome/core.jsonc",
    "./.droneey/constitution/presets/typescript/biome/react-dom.jsonc",
    "./.droneey/constitution/presets/typescript/biome/architecture/core.jsonc"
  ]
}
```

A tool without `extends` — knip, Stryker, syncpack — imports the parts and joins their lists. Ruff, whose `extend` takes one file, chains its parts, each extending the one before; ty, which takes one `--config-file`, gets one part; python-check lists its parts in `extend` of `[tool.python-check]`; a tool with neither starts from a template of `templates/project/<block>/`.

Beside the parts of each axis, a preset holds a `bindings.yaml` — `presets/<scope>/<tool>/bindings.yaml` for the base, `presets/<scope>/<tool>/architecture/bindings.yaml` for the architecture axis: which setting of which part holds which rule, by part and rule, each setting as the part's file spells it. The blocks never name them; the rules stay the blocks' own.

```yaml
typescript:
  no-any: [noExplicitAny]
core:
  biome-refuses-empty-verbs: [biome-refuses-empty-verbs.grit]
```

## 🧭 What a session receives

The hook finds the `constitution.yaml` of the repository a session works in and gives the agent one digest, within Claude Code's 10,000-character cap: the installed version and where the block files live, the warnings about the file, core's part, the active blocks by layer — each with its summary and the chapters and `with/` files of the axes it follows — and each unit's blocks under its path, then the overrides. The agent reads the block files the digest names. A sub-agent receives the same digest; a repository without `constitution.yaml` receives nothing. The hook runs on bash 3.2 and any POSIX awk, and reads nothing else in the project, so a project in any language can follow the constitution.

At the start of a session it also saves the resolved active set outside the project, in `/tmp/droneey-constitution-<uid>/<session_id>/` — one place for the hooks and for the skills' commands, which a sandbox may give another `TMPDIR`: the project's root, its check command — none for `check: null` — and each active block with the globs it governs and its files. The later hooks and skills read it there and never resolve again; `clear` and `compact` start the session's reminders over.

When the agent reads or edits a file, a second hook matches it against the `governs` globs of the active blocks — of its unit, when it lies under one. A block also governs what every active block that needs it governs, through `requires`, `extends` and an active `with/` seam, so a domain that names no file form of its own — `ui`, `untrusted-client`, `unreliable-network` — is matched by the files of the blocks that bring it in. The hook tells the agent, once per block per context, which block governs the file, the block's files and its MUST rules — a rule an override lowered marked with its new level — in at most 300 bytes.

At the hand-back, a third hook holds the gate. When the project names a `check` command and the tree changed since it last passed, the stop is blocked once, and the agent is told to run the command; a passing run — the command whole, first on its line or after `&&` or `;` — is recorded as it happens, and a failing one never counts. Then, when the changed files fall under a block's `governs` and `/check edits` did not review them, the user sees one line naming those blocks; nothing is blocked, and the agent spends nothing. A sub-agent meets only the first step. A project with `check: null` meets only the second.

## ✍️ Skills

Both are run by the user, never by the model on its own:

- **`/constitution:ratify`** looks at the repository — manifests, lock files, folders, CI — and proposes the blocks for each key of `constitution.yaml`, each with its reason, from those the plugin offers. The owner confirms or corrects them; a library without a block becomes a draft local block from `templates/block.md`, or is left out. It finds the check command or asks for it — `check: null` when the repository has none — asks about units when there are several, and interviews the owner for `PROJECT.md` one or two questions at a time, leaving out what stays unanswered. It shows everything it will write, lists every `partly` and `no` answer of the proposed blocks with the rule that stands in, and writes only after the owner's yes, never over a file without asking.
- **`/constitution:amend [rule-slug]`** adds, changes or removes an override: a rule the index holds, a level below its current one, a reason, an optional end date and a scope — the whole repository or one unit. It shows the exact change to `constitution.yaml` and writes it only after the owner's yes for that override.

The model may run one more itself, as the hand-back reminder suggests:

- **`/constitution:check [all|edits] [lens]`** runs the project's `check`, when there is one, then asks the `reviewer` agent to judge the changed files — or, with `all`, the whole project — against the rules of the blocks that govern them; a lens narrows it to the rules of one tag. The reviewer reads, never edits, and returns one finding per line: `<path>:<line> — <slug> — <what is wrong> — <the fix>`. When it finishes, a hook records the review, and the reminder waits for the next change.

## 🔌 Install

The constitution is a Claude Code plugin served from this repository. Once per machine:

```bash
claude plugin marketplace add droneey/constitution
```

```bash
claude plugin install constitution@droneey
```

The marketplace serves the plugin from the tag of its latest release: each release commit writes its tag into `.claude-plugin/marketplace.json`, so `claude plugin marketplace update` brings a release, never unreleased work on `main`.

## 🛠️ Development

```bash
mise trust && mise install   # bun, Python and uv, and the Python tools of the dev group
bun install                  # installs the git hooks
bun run check                # lint, manifests, types, imports, unit and end-to-end tests, mutation, the Python tools' own checks, blocks, secrets, names, unused code, vulnerabilities
bun run digests:write        # regenerate digests/ after a change to a block
bun run build                # build tools/mutation-check/dist/main.js and the Python tools' .pyz, as the release does
claude --plugin-dir .        # a session on the working tree's plugin instead of the installed release
```

The release commit writes the version into `package.json`, `constitution.yaml` and the marketplace's tag together, so none of them is edited by hand, and a session with `--plugin-dir .` runs the same version this repository pins.

The end-to-end spec in `tests/e2e/` builds a plugin root from fixture blocks and runs the real hook over fixture projects. `bun run test` runs the unit specs, then the end-to-end ones, which plain `bun test` skips; `HOOK_SHELL=/bin/bash bun run test` runs the hook under the bash 3.2 macOS ships.

`blocks:check` loads every block and fails on:
- a file outside a block folder, a stray file inside one — anything but the card, a chapter and a `with/` file at its root or in `architecture/` or `workflow/` — or two blocks with one id;
- a front matter that lacks a field, adds one, lists them out of order, breaks a field's form, or fills one its layer leaves empty, and a `languages` entry that is no language block;
- a `requires` that points down, or sideways where the layer allows no peer, an `extends` of anything but an abstract implementation, a `with/` file named after a block below its own layer, and a cycle between implementations;
- a link or a rule slug that refers to another block anywhere but the front matter, a `with/` name or the arrow of a rule heading;
- an abstract block without an heir, or one that names its heirs;
- an owned word outside its owner and the blocks that depend on it;
- a rule without a statement, a Why or a known tag, a slug used twice, a heading or table that misses the rule format, and a heading that looks like a rule at another level than the third;
- a rule that carries out a rule of its own block or a rule on an axis it may not refer to — a rule of the base carries out only a rule of the base, one of `architecture/` or `workflow/` one of its own axis or of the base — a stated level looser than the one it inherits or equal to it, a cycle and a missing rule;
- a word of `vocabulary.yaml` outside its axis: an `architecture` word anywhere but `architecture/`, a `workflow` word anywhere but `workflow/`, and so either at a block's root;
- a malformed Requirements row, an answer to a rule its block may not answer, a `partly` or `no` answer that names in backticks no rule of its own block, or a Requirements table outside an implementation's card and chapters;
- a preset file that is not, at the tool's root or in `architecture/` or `workflow/`, a part named after a block or `self`, a plugin in `plugins/` named after a rule of that axis, or `bindings.yaml`, or that sits in a scope neither `common` nor a language its tool covers;
- a binding whose rule, part or setting does not hold, or whose rule sits on an axis its file's folder may not hold — the base's bindings hold rules of the base, an optional axis's those of its axis or of the base — or whose rule belongs to a block below its part; a setting that holds no rule is never reported;
- a file over 500 lines, and a link to a missing file;
- a broken plugin, marketplace or hooks manifest, a marketplace that serves the plugin other than from its manifest's GitHub repository at a release tag, a skill folder without `SKILL.md`, a `SKILL.md` without a `name` and a `description` in its front matter, and a missing template;
- a decision log that is missing, repeats a number or lets it fall, or has an entry without its date and status;
- a `digests/` file that is missing or differs from its regeneration, a file there the generator does not write, and a core part of the digest over 3,500 bytes.

It checks the blocks across each other only once every block loads, so a broken block is reported once, not by every block that names it.

After the findings it prints advice that does not fail the check: rules of sibling blocks similar enough to lift one layer up.

## ⚙️ Workflows

| 📄 File | ⚡ Trigger | 🎯 Does |
|---|---|---|
| `ci-check.yaml` | pull request into `main` | The check with the hook under mawk, the build of the archive's tools, the unit and end-to-end specs again under gawk, the workflow lint; on macOS, the specs with the hook under `/bin/bash` 3.2 and the system awk |
| `cd-version.yaml` | push to `main` | Calls `droneey/.github`: bumps `package.json` from the merged branch prefix and pushes the `vX.Y.Z` tag |
| `cd-pre-release.yaml` | tag `v*` | Calls `droneey/.github`: builds the archive's tools, packs `presets/`, `templates/` and the built tools into `constitution.tar.gz` with its checksum, and opens the pre-release with its changelog |

## 🛠️ Changing it

- Every change lands through a pull request into `main`, squash-merged, with its entry in `DECISIONS.md` when it is a decision.
- A file stays under 500 lines, and a block refers only to the layers above it and, among implementations, to the host it requires and the abstract base it extends.

## 📄 License

[PolyForm Internal Use 1.0.0](LICENSE.md): use it inside your own organisation, commercially or not; do not distribute, sublicense or sell it; keep the author's notice. Copyright Dmytro Kurovskyi.
