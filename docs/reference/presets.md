# Presets

> How a tool's settings sit in preset files, which of them a unit takes, and how `constitution` writes and checks them.

[Wire the tools](../guides/wire-the-tools.md) shows a project taking them. What an entry sets is in its preset file, under the rule it holds; the `Presets` rules of [placement](../../packages/constitution/blocks/core/@foundation/placement.md) say where each setting goes.

## Layout

A tool's settings sit in preset files in [`presets/`](../../packages/constitution/presets), which the release links as `.droneey/constitution/presets/`, one folder for each tool that reads them, named by its block's id, and `core/` for the files only agents read, such as `AGENTS.md`:

```text
presets/
└── <reader>/                         the tool that reads the settings: biome, js-runtime/bun
    ├── @foundation.yaml              the entries every project takes
    ├── @architecture.yaml            those of the optional axes
    ├── @workflow.yaml
    ├── @<axis>/with/<block>.yaml     those that need a block beyond the reader's reach
    ├── @<axis>/with/<block>/with/<partner>.yaml
    └── plugins/<language>/<rule>.*   a plugin, named by the rule it holds
```

A `<block>` and a `<partner>` are block ids, so one may run over folders, as in `biome/@foundation/with/client/browser.yaml`. A preset file's path names at most two blocks beside its reader, each one the reader neither reaches nor is reached by.

A plugin of `shell`, such as `lefthook/plugins/shell/commit-body-left-empty.sh`, is a shell script a command of the tool's file runs, since shell code a file holds is a plain command and what needs more moves into a script. One the runners' scripts and tasks share sits in the folder of the tool it runs, `osv-scanner/plugins/shell/`, and one no rule names in `shell/`, as `shell/run-on-shell-scripts.sh`, which hands a command the unit's shell scripts. A program too large for a script, such as the mutation gate Stryker's preset runs, is built from a package of its own that imports nothing of the Constitution and ships under the release's `tools/`, as `${constitution.path}/tools/mutation-check/dist/main.js`.

An entry sits on the axis of the rule it holds, in the reader's preset file, and under `with/` exactly when it needs a block the reader does not reach: `noTailwindRawColors` sits in `biome/@foundation/with/tailwind/with/presentation/design-system.yaml`, as it needs both. A setting a reader takes only beside a block that requires that reader sits in that block's own preset file, under the reader's key, as Bun's test runner gives Bun's `check` script its `test` in `presets/bun-test/@foundation.yaml`.

## An entry

A preset file is a map, five levels deep:

```yaml
<block>:                    the block whose rule the entry holds
  <rule>:                   that rule's slug, or '*' for a setting the tool needs and no rule asks
    <language>:             the language whose files the reader reads, or '*'
      <file> !<format> ? <guard>:  the file the entry writes, a mark of its format and a guard after it where they apply
        <settings>          what the entry writes into the file
```

The settings are those the file holds, in its own shape: a table of JSON, TOML or YAML, the lines of a file such as `.gitignore`, or a whole file's text.

| Form | Means |
|---|---|
| `list[field=value]` | the item of a list whose field holds the value: a dependency-cruiser rule by its name, an import contract by its id |
| `list@name`, `- slot: name` | a place in a list where other entries insert their items, in their blocks' order |
| `list[slot=name]` | the item of a list one of whose own lists places the slot, which holds only inserts: `overrides[slot=injected-classes].includes@injected-classes` fills a Biome override that no field names; no item placing it is `missing-slot`, two are `slot-placed-twice` |
| `!replace` | replaces what the entries before gave, a list or a value, instead of joining it |
| `!default` | written once, while the file lacks it, and never checked again: a starter file the project owns, on whose content no rule depends |
| `<file>: !copy ${constitution.path}/presets/<reader>/plugins/…` | the file holds a plugin of the release whole, its facts filled in: written again by each apply, so a later release's plugin replaces the copy, and checked as a whole text |
| `!words` | on a list: written as one text, its items joined by spaces |
| `!sorted` | on a map of a JSON or YAML file: its keys, the project's own among them, stand in their order as texts, as Bun's `scripts` do, each action's script heading its group; in a file of another format, whose writer keeps no order of its keys, the check of the presets reports it (`sorted-in-unsortable-file`) |
| `<path>: !inherits <path>` | no setting but a declaration: the value at each path its key names starts, once the entries have joined, from the value at the path its text names, both paths read from the map that holds it, step by step at each `.` — `*` every item or key, `<name>` every key, which the text may then name; the inheriting value lies over the inherited one, maps joined key by key, lists holding the inherited items and then those not yet held, any other value the inheriting one's. A path that holds nothing changes nothing, and a declaration whose paths cannot be followed is `inheritance-malformed`, each flaw named. Biome's preset declares `overrides.*.linter.rules.<group>.<rule>.options: !inherits linter.rules.<group>.<rule>.options`, since Biome replaces a rule's options in an override instead of joining them |

Within a value, a fact stands for what `constitution` knows of the unit:

| Fact | Becomes |
|---|---|
| `${constitution.path}` | the path from the file to the release's folder |
| `${package.name}` | the unit's `name` in `constitution.yaml` |
| `${unit.parent}` | the folder at the repository's root that holds the unit, `apps` or `packages`, however deep the unit lies in it; nothing for the repository's own unit |
| `${unit.depth}` | how many folders the unit lies below that folder, `1` for `apps/web`, `2` for `apps/<group>/web`; nothing where `${unit.parent}` is nothing |
| `${role.<id>}` | the spelling of the folder, the suffix or the file whose term carries that id, a file's without its extension, so `${role.entry}` is `main` where TypeScript's `main.ts` carries the id, as the most specific block the entry's language reaches spells it — for an entry of every language, the blocks of its key and its preset file's path; nothing where only a placeholder such as core's `<entry>` names the file |
| `${term.<id>}` | in a copied plugin only: the words the concept carrying that id lists, as the same block spells them, each in the quotes around the fact and joined by `, `, so a GritQL snippet of `${term.empty-names}` in backticks becomes one snippet for each empty name |
| `${workspace.members}` | each member's folder, one item each, at the root of a workspace; nothing elsewhere |

In the place of a file, an entry of a runner's block may give `${constitution.run}`: what `constitution run` runs in the unit, a list of commands for each entry point, `check`, `test` and `fix`, which no file holds and `constitution` reads. The lists join as a file's do, so two runners of one unit both run, each by its unit's own `check`:

```yaml
task-runner:
  unit-run-through-its-action-tasks:
    typescript:
      ${constitution.run}:
        check:
          - bun run check
        fix:
          - bun run fix
```

A list marked `!words` is written as one text, its items spaced, so the entries that join it, or insert at its slots, compose a command: Bun's `check` places the slots `checks`, `tests` and `mutations`, and the tools' pairings insert `'check:*'`, `test` and `mutate:branch`, each only where the unit has the scripts it names.

A tool's block gives its scripts or tasks through its pairing with the runner, `presets/js-runtime/bun/@foundation/with/biome.yaml`, so the runner decides how a tool runs. A tool's block requires the runner it needs, `task-runner` or `js-runtime`, so a unit with the tool and no runner fails the requirement; a unit whose runners pair with none of a tool's preset files is reported as `tool-without-runner`. A tool that requires its runner gives its own entry point in its own preset file, as Bun's test runner gives `test` in `presets/bun-test/@foundation.yaml`: a block that gives `${constitution.run}` and reaches another that gives it is no runner, its lists joining its runner's, so its own pairings configure it and run no tool.

A guard writes the file only where it holds: `${file.isTop}`, in the unit no unit above gets the same entry for; `${unit.isRepositoryRoot}`, in the repository's own unit, the root of a workspace or a repository of one unit; `${workspace.isRoot}`, at the root of a workspace; or a fact of a text compared with a text, its facts resolved, `${unit.parent} = ${role.deployed-unit}`, in a unit of `apps/`, where both resolve and are the same; each with `!` before its fact for its opposite.

A plugin that names the project's words is copied rather than named by its path, so that it runs with its tool alone: Biome's entry for `biome-refuses-empty-names` writes `biome.gen/biome-refuses-empty-names.grit` from the release's plugin, the empty names core's `names` chapter lists filled in, names that copy in `plugins`, and leaves `biome.gen/` out of the files Biome checks, so no fix reformats it.

```yaml
biome:
  biome-refuses-empty-names:
    typescript:
      biome.jsonc:
        files:
          includes:
            - '!!**/biome.${role.generated-file}'
        plugins:
          - ./biome.${role.generated-file}/biome-refuses-empty-names.${role.grit-rule}
      biome.${role.generated-file}/biome-refuses-empty-names.${role.grit-rule}: !copy ${constitution.path}/presets/biome/plugins/typescript/biome-refuses-empty-names.${role.grit-rule}
```

A mark after the file's path names the format of its text where the name does not: `tsconfig.json !jsonc` writes JSON with comments under a `.json` name, for a tool that reads them there, its commas as plain JSON has them.

## What a unit takes

A unit is the repository, or a [member of its workspace](constitution-yaml.md#members-of-a-workspace), each with the blocks of its own `constitution.yaml`. A unit takes every entry whose block is active in it, whose rule is in force there — an [override](../guides/override-a-rule.md) that lowers a rule takes its entries out —, whose axis it follows, whose language it lists, and whose `with/` blocks are all active. The presets of each pack the unit lists under [`packs:`](constitution-yaml.md#packs) count as the release's do; a package's own pack sits in `<package>/pack/`.

The entries of one file join in the blocks' order: a list holds the items of each, a table the keys of each, and two entries that give one key different values clash, which the check of the presets reports.

## Apply, plan and check

`constitution presets apply` writes, from the repository root, every file of every unit: it keeps the settings the file holds of its own and its comments, names [the block that brings each setting](#the-block-that-brings-each-setting), adds a `!default` only where the file lacks it, and removes what an earlier apply wrote that no entry gives any longer. A file no entry writes any longer loses the comments naming its blocks; one an apply created, which then holds nothing, is deleted, while a file the project wrote first keeps what is its own. `constitution.lock`, beside each unit's `constitution.yaml`, records what it wrote; a pull request whose locks conflict runs `apply` again.

`constitution presets plan` prints, file by file, the entries that write into it.

`constitution presets check`, `constitution check` and the session-start digest report, as `configurations` warnings, a setting a file lacks or holds as an earlier release gave it (`missing`), one an earlier apply wrote that no entry gives (`stale`), one the file loosens (`loosened`), a map kept sorted whose keys the file orders otherwise (`unsorted`), a file or a lock that does not parse, and what is wrong in the presets themselves: a preset file out of the layout, or whose path names a block its reader reaches; an entry of an unknown block or rule, off its rule's axis, in a file whose path names other blocks than it needs, or keyed by a rule that is not a `MUST` (`keyed-rule-not-must`), since a rule a tool checks is a `MUST`; a role no term carries, or a role's spelling typed by hand where `${role.<id>}` names it (`hand-typed-role`); two entries that clash; a plugin no entry names, one named after no rule, one whose message names a rule that is not a `MUST` (`plugin-rule-not-must`), a plugin that names a fact other than a role or a term a block defines (`plugin-unknown-fact`), or names one and is named by its path, which fills nothing (`plugin-named-unfilled`), and a file of the release an entry names that the release lacks and its distribution does not pack (`missing-distribution-file`): the distribution's map, `distribution.json` beside the package that delivers it, names each file it packs by the package whose `build` makes it and the file of that build's output, and such a file counts while that package declares a `build`.

## The block that brings each setting

In every file whose format holds comments — TOML, YAML, JSONC, a file of sections such as `.editorconfig`, and a file of lines such as `.gitignore`, never strict JSON — apply names the block that brings each setting. That block is the first block the entry's preset file is named with, `presets/<reader>/@<axis>/with/<block>…`, or the reader where it is named with none: `git` for `presets/git/@foundation.yaml`, `tsc` for `presets/git/@foundation/with/tsc/with/workspace.yaml`, `js-runtime/bun` for `presets/js-runtime/bun/@foundation.yaml`. One rule holds for every format:

- A comment `# <block>`, or `// <block>` in JSONC, stands above a key, a table or an item that one block alone brings, with everything inside it; a key or an item several blocks fill takes none, and its own keys and items are named in turn.
- Of a run of such keys or items of one map or list that one block brings, back to back, only the first is named; a key of the project's own between them starts a new run.
- A setting written as a `!default` is the project's own once written, and is named by no block.
- The comment opens a paragraph of its own: a blank line stands before it, unless it opens the file or follows the line that opens what holds it — a table's or a section's header, or the brace, bracket or colon of a map or a list. The comments of the project right above what it names stay under it, so an explanation stands directly above the value it explains.
- A key or an item that does not begin its line, such as one of a list written on one line, takes no comment.
- A file of lines keeps its own lines first, then the lines of each block under its name, a blank line between groups.

The comment is `constitution`'s: a full-line comment that is exactly the name of a block that an entry of the presets, applied in the unit or not, gives for a file of that name is taken out before every write and laid again, so it moves and goes with what it names and a second apply writes nothing; every other comment is the project's and stays. The check compares values, never comments.

```toml
[tool.ruff.lint]
extend-select = [
  # ruff
  "ARG",
  "F401",

  # pytest
  "PT"
]

# ruff
extend-ignore = ["D1"]

# vulture
[tool.vulture]
paths = ["src"]
```
