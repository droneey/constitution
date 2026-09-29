# constitution

The engineering constitution of droneey: the rules every repository is built by, split into **blocks**. A project lists the blocks it follows in one file, `constitution.yaml`, and describes itself in `PROJECT.md`; everything else lives here, versioned by tags.

The constitution is being rebuilt as v1.0 in seven steps, tracked in #50.

## 📦 Layout

| 📂 Path | 🧩 Holds |
|---|---|
| `blocks/core` | What holds for any program, always active: `core.md`, how to use the constitution, and its chapters on each axis, `principles` first |
| `blocks/domains/<id>` | An aspect a project has or has not, whatever its technology — `ui`, `api`, `version-control` |
| `blocks/contexts/platforms/<id>` | Where the code runs — `browser`, `mobile`, `cli`, `server` |
| `blocks/contexts/languages/<id>` | What it is written in — `typescript`, `python` |
| `blocks/implementations/<id>` | A framework, library or tool — `react-dom`, `bun`, `git` |
| `digests` | What the hook reads, generated from the blocks by `bun run digests:write` and committed: `index.tsv`, one record per role, block — with the languages its checks cover and the roles a language is held to — rule and requirement answer, and `core.md`, core's part of the digest |
| `hooks` | `hooks.json`, which runs `session-start.sh` when a session starts, is cleared or compacted, and when a sub-agent starts; `lib/`, the awk programs it runs over the event, `constitution.yaml` and `digests/` |
| `skills` | `/ratify` and `/amend`, which write a project's files |
| `presets` | The tool configurations that hold the tool-checked rules, `presets/<scope>/<tool>/<axis>/<block>.*` |
| `templates` | What `/ratify` writes from: `constitution.yaml`, `PROJECT.md`, and `block.md` for a local block; `project/<block>/`, a project's starter files |
| `tools` | Programs the release archive carries, such as `mutation-check`, which mutates only the lines a change touches |
| `.claude-plugin` | The plugin and marketplace manifests |
| `src` | The tooling that keeps the blocks sound |
| `DECISIONS.md` | The constitution's own decision log |
| `vocabulary.yaml` | The words of one meaning the `architecture` and `workflow` axes own — terms, folders of the tree, role suffixes, branch prefixes |
| `.claude/agents/rule-placement.md` | The agent that judges, by meaning, the layer and axis of every rule a change adds or rewrites |

A block is a folder. Its card `<id>.md` opens with a front matter that declares every field — `id`, `summary`, `requires`, `extends`, `abstract`, `checks`, `languages`, `roles`, `dictionary`, `governs` — and then its summary; its layer is its folder. Its rules sit on three axes, one folder each: `foundation/` holds what any team wants, `architecture/` the structure of a system — its layers, the direction of its dependencies, its ports and adapters, its composition root and its tree — and `workflow/` how a change travels from the idea to the release. A project follows the axes it lists in `constitution.yaml`; a team with its own architecture or workflow leaves that axis out. Each axis folder holds the block's chapters — `<id>.md` and any other file, one topic each — and its seams in `with/`. A rule is a heading in one of them:

```markdown
## four-data-states · MUST
Every data view shows four states: loading, empty, error and content.

| Why | Check | Tags |
|---|---|---|
| an empty screen cannot otherwise be told from a slow one. | test | [ux, a11y] |
```

A rule that carries out another names it with an arrow instead of a level, and takes its level and its tags from it: `## query-result-returned-as-status-union → four-data-states`. It may state a stricter level, `## x → y · MUST`, never a looser one, and an override of a rule lowers every rule under it that states none. A rule carries out one rule at most.

The levels mean what [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) give them, in capitals only. A rule's level is MUST where a violation is plainly wrong and answered yes or no, most often by a tool, and SHOULD where it takes judgement or has reasonable exceptions; MAY marks a permitted choice. A MUST binds until an override lowers it; a SHOULD may be left with a stated reason. The digest prints MUST headlines, and only MUST rules raise the hook's warnings.

A rule's Check is `test`, `review`, or `tool/<role>`. A rule names the role of the tool that holds it, never the tool; a tool's block lists the roles it checks:

| 🔎 Role | ✅ The tool proves |
|---|---|
| `format` | the code is formatted |
| `lint` | code-level rules hold |
| `types` | the types check |
| `architecture` | imports follow the layers |
| `names` | files and folders follow the vocabulary; any language |
| `unused` | no unused file, dependency or code |
| `versions` | each dependency has one version |
| `tests` | the tests pass |
| `coverage` | the coverage gate holds |
| `mutation` | every mutant of the logic is killed |
| `secrets` | no secret is committed; any language |
| `audit` | no known vulnerability, and only allowed licences; any language |
| `commits` | commit messages and branch names follow their format; any language |

A tool's block lists in `languages` the language blocks whose files its checks cover, whatever it requires: Biome requires `typescript` and covers `typescript` and `css`. A tool that lists none holds only the roles of any language, for every language. A language block lists in `roles` the roles its files are held to — `css` is held to `format`, `lint` and `names`, not to `tests` — and every other block leaves both empty. A language then needs each role of an active MUST rule that holds for it and that it is held to; a role no active tool covers for it is a warning of the hook and advice of `blocks:check`.

A rule's Tags are lenses for the concerns that cross every axis and layer — `a11y`, `data`, `errors`, `performance`, `security`, `testing`, `ux` — so a review can take one concern across the whole project. They are optional: a full review reads every rule, and a rule inherits the tags of the rule it carries out.

A block refers only to the layers above it, through its front matter. The rules at its seam with another block of its own layer or above live in its `<axis>/with/<other>.md`. A brand, a language or a file form belongs to the block whose `dictionary` holds it, and only that block and the blocks that depend on it may name it.

## 🧰 Presets

A project takes its tool configurations from the release archive, `constitution.tar.gz`, which mise installs pinned by version and links as `.constitution/`. It holds `presets/`, `templates/` and the built `tools/`. A preset is split into parts, `presets/<scope>/<tool>/<axis>/<block>.*`:
- the scope is the files the part reads: `common` for any language, or a language block — `typescript`, `css` — for that language's files alone; a tool lists the languages it covers in its block's `languages`, and a project takes the scopes of its active languages;
- the tool folder is the tool's block — `biome`, `dependency-cruiser`, `ls-lint`, `tsc` for the compiler;
- the axis folder is the axis whose rules the part holds, so a project that leaves an axis out leaves out its parts;
- a part is named after the block its settings need, the one without which they mean nothing: `noTailwindArbitraryValue` sits in `tailwind`, though the rule it holds is `ui`'s; settings that need no block beyond the tool sit in `core` when they hold a rule of core and in `self` when they are the tool's own; GritQL rules are `<axis>/plugins/<rule-slug>.grit`.

A project's configuration extends the parts of its active blocks on its axes, foundation first:

```json
{
  "extends": [
    "./.constitution/presets/common/biome/foundation/self.jsonc",
    "./.constitution/presets/typescript/biome/foundation/typescript.jsonc",
    "./.constitution/presets/typescript/biome/foundation/self.jsonc",
    "./.constitution/presets/typescript/biome/foundation/core.jsonc",
    "./.constitution/presets/typescript/biome/foundation/react-dom.jsonc",
    "./.constitution/presets/typescript/biome/architecture/core.jsonc"
  ]
}
```

A tool without `extends` — knip, Stryker, syncpack — imports the parts and joins their lists.

Beside its parts, a preset holds `presets/<scope>/<tool>/bindings.yaml`: which setting of which part holds which rule, by axis, part and rule, each setting as the part's file spells it. The blocks never name them; the rules stay the blocks' own.

```yaml
foundation:
  typescript:
    no-any: [noExplicitAny]
  core:
    no-empty-verbs: [no-empty-verbs.grit]
```

## 🧭 What a session receives

The hook finds the `constitution.yaml` of the repository a session works in and gives the agent one digest, within Claude Code's 10,000-character cap: the installed version and where the block files live, the warnings about the file, core's part, the active blocks by layer — each with its summary and the chapters and `with/` files of the axes it follows — and each application's blocks under its path, the overrides, then MUST headlines while space lasts. The agent reads the block files the digest names. A sub-agent receives the same digest; a repository without `constitution.yaml` receives nothing. The hook runs on bash 3.2 and any POSIX awk, and reads nothing else in the project, so a project in any language can follow the constitution.

At the start of a session it also saves the resolved active set outside the project, in `${TMPDIR}/droneey-constitution/<session_id>/`: the project's root, its check command — none for `check: null` — and each active block with the globs it governs and its files. The later hooks and skills read it there and never resolve again; `clear` and `compact` start the session's reminders over.

When the agent reads or edits a file, a second hook matches it against the `governs` globs of the active blocks — of its application, when it lies under one — and tells the agent, once per block per context, which block governs the file, the block's files and its MUST rules, in at most 300 bytes.

At the hand-back, a third hook holds the gate. When the project names a `check` command and the tree changed since it last passed, the stop is blocked once, and the agent is told to run the command; a passing run — the command whole, first on its line or after `&&` or `;` — is recorded as it happens, and a failing one never counts. Then, when the changed files fall under a block's `governs` and `/check edits` did not review them, the user sees one line naming those blocks; nothing is blocked, and the agent spends nothing. A sub-agent meets only the first step. A project with `check: null` meets only the second.

## ✍️ Skills

Both are run by the user, never by the model on its own:

- **`/constitution:ratify`** looks at the repository — manifests, lock files, folders, CI — and proposes the blocks for each key of `constitution.yaml`, each with its reason, from those the plugin offers. The owner confirms or corrects them; a library without a block becomes a draft local block from `templates/block.md`, or is left out. It finds the check command or asks for it — `check: null` when the repository has none — asks about applications when there are several, and interviews the owner for `PROJECT.md` one or two questions at a time, leaving out what stays unanswered. It shows everything it will write and writes only after the owner's yes, never over a file without asking.
- **`/constitution:amend [rule-slug]`** adds, changes or removes an override: a rule the index holds, a level below its current one, a reason, an optional end date and a scope — the whole repository or one application. It shows the exact change to `constitution.yaml` and writes it only after the owner's yes for that override.

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
mise trust && mise install   # bun
bun install                  # installs the git hooks
bun run check                # lint, package manifests, types, tests with the coverage gate, mutation, then the blocks check
bun run digests:write        # regenerate digests/ after a change to a block
bun run build                # build tools/mutation-check/dist/main.js, as the release does
claude --plugin-dir .        # a session on the working tree's plugin instead of the installed release
```

The release commit writes the version into `package.json`, `constitution.yaml` and the marketplace's tag together, so none of them is edited by hand, and a session with `--plugin-dir .` runs the same version this repository pins.

The end-to-end spec in `tests/e2e/` builds a plugin root from fixture blocks and runs the real hook over fixture projects; `HOOK_SHELL=/bin/bash bun test` runs it under the bash 3.2 macOS ships.

`blocks:check` loads every block and fails on:
- a file outside a block folder, a stray file inside one, or two blocks with one id;
- a front matter that lacks a field, adds one, lists them out of order, breaks a field's form, or fills one its layer leaves empty; a `languages` entry that is no language block, and `languages` on a block that checks no role;
- a `requires` or `extends` that points down, or sideways where the layer allows no peer, a `with/` file named after a block below its own layer, and a cycle between implementations;
- a link or a rule slug that refers to another block anywhere but the front matter, a `with/` name or the arrow of a rule heading;
- an abstract block without an heir, or one that names its heirs;
- an owned word outside its owner and the blocks that depend on it;
- a rule without a Why, a Check or a known tag, a slug used twice, and a heading or table that misses the rule format;
- a rule that carries out a rule on an axis it may not refer to, a stated level looser than the one it inherits, a cycle and a missing rule;
- a word of `vocabulary.yaml` outside its axis: an `architecture` word anywhere but `architecture/`, a `workflow` word anywhere but `workflow/`, and either in a card;
- a malformed Requirements row, an answer to a rule its block may not answer, or a Requirements table outside an implementation's card and chapters;
- a preset file that is not a part named after a block or `self`, a plugin named after a rule of its axis, or `bindings.yaml`, or that sits in a scope neither `common` nor a language its tool covers;
- a binding whose rule, axis, part or setting does not hold, or whose rule belongs to a block below its part, and a rule a tool checks that no binding, no held rule under it and no account of the tool's own run holds; a setting that holds no rule is never reported;
- a file over 500 lines, and a link to a missing file;
- a broken plugin, marketplace or hooks manifest, a marketplace that serves the plugin other than from its manifest's GitHub repository at a release tag, a skill folder without `SKILL.md`, a `SKILL.md` without a `name` and a `description` in its front matter, and a missing template;
- a decision log that is missing, repeats a number or lets it fall, or has an entry without its date and status;
- a `digests/` file that is missing or differs from its regeneration, a file there the generator does not write, and a core part of the digest over 3,500 bytes.

It checks the blocks across each other only once every block loads, so a broken block is reported once, not by every block that names it.

After the findings it prints advice that does not fail the check: the roles a language is held to that its tool-checked MUST rules need and no tool covers for it, and rules of sibling blocks similar enough to lift one layer up.

## ⚙️ Workflows

| 📄 File | ⚡ Trigger | 🎯 Does |
|---|---|---|
| `ci-check.yaml` | pull request into `main` | Lint, types, tests with the hook under mawk and again under gawk, the blocks check, the build of `mutation-check`, the workflow lint; on macOS, the hook under `/bin/bash` 3.2 and the system awk |
| `cd-version.yaml` | push to `main` | Calls `droneey/.github`: bumps `package.json` from the merged branch prefix and pushes the `vX.Y.Z` tag |
| `cd-pre-release.yaml` | tag `v*` | Calls `droneey/.github`: builds `mutation-check`, packs `presets/`, `templates/` and the built tools into `constitution.tar.gz` with its checksum, and opens the pre-release with its changelog |

## 🛠️ Changing it

- Every change lands through a pull request into `main`, squash-merged, with its entry in `DECISIONS.md` when it is a decision.
- A file stays under 500 lines, and a block refers only to the layers above it.

## 📄 License

[PolyForm Internal Use 1.0.0](LICENSE.md): use it inside your own organisation, commercially or not; do not distribute, sublicense or sell it; keep the author's notice. Copyright Dmytro Kurovskyi.
