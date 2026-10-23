# Presets

> How a tool's settings are split into parts, which parts a project takes, and how the session checks it takes them.

[Use the presets](../guides/use-the-presets.md) shows a project taking them. What each part sets is in the part itself, and why a tool holds a rule in its block's passport.

## Layout

A preset is split into parts, one per block whose rules the tool holds. They sit in [`presets/`](../../packages/constitution/presets), which the release links as `.droneey/constitution/presets/`:

```text
presets/
└── <scope>/                common, or a language
    ├── <tool>/             the tool's block
    │   ├── foundation/     the parts every project takes
    │   │   ├── <block>.<ext>
    │   │   ├── self.<ext>  the tool's own settings
    │   │   ├── plugins/
    │   │   └── bindings.yaml
    │   ├── architecture/   the same form, for that axis
    │   └── workflow/
    └── <name>.<ext>        a module the scope's configurations share
```

A part is named after the block its settings need: `noTailwindArbitraryValue` sits in `tailwind`, though the rule it holds is `ui`'s. `core` holds the settings of core's rules, and `self` the tool's own settings.

## The parts a project takes

A unit is the repository, or a path under [`packages:`](constitution-yaml.md#packages), which adds its blocks to the repository's; a workspace lists every package there, and a folder no path names follows the repository's blocks. For each unit, each scope it reads — `common`, then each of its active languages — and each of its active tools with a folder in that scope, the unit takes, on `foundation` and on each axis it follows, the parts that exist of:

1. `self`;
2. `core`;
3. the scope's language;
4. every other active block, abstract bases included, in the order the digest lists them: domains, platforms, languages, implementations, each by id.

A part is taken whether or not its bindings name a rule. The presets and templates of each pack the project lists under [`packs:`](constitution-yaml.md#packs) count as the release's do, named by the pack's path. Each tool is served, for a unit, by the nearest file at or above the unit's folder that bears a name of the tool's template and names the tool's parts; that file takes the parts of every unit it serves, their blocks and axes joined, so a tool configured once at the root takes the parts of every unit that keeps no file of its own. A file several tools share, such as `pyproject.toml` or `mise.toml`, serves only the tools whose parts it names. A tool whose parts form a chain also takes each link a taken part extends. At the root of a workspace — the repository with `workspace` active — a tool that has a `workspace` part takes there only the workspace parts of the axes the root follows, and `self`: the root runs it only for what crosses the packages, which each hold the rest in their own folder.

`constitution wiring` prints this computation for the project it runs in, file by file, with the units each file serves, and [`/constitution:ratify`](skills.md#constitutionratify) writes the configurations from it.

## How a tool takes them

Every tool with parts has [a template](templates.md) of its configuration that shows how it takes them, and every way names each part by its path in the release:

| The tool | Its configuration |
|---|---|
| lists files to extend | names each part, in order, where it lists them: `extends`, imports it joins, `extend` of a table |
| extends one file, the parts a chain | extends the last part, under a line `# from <path>, <path>, …` that names every link |
| reads no other file | holds each part's content, copied between a line `# from <path>` and a line `# end <path>` |
| takes its configuration on the command line | is the command that runs it, in the runner the unit already uses for its scope — a script of `package.json`, a poe task of `pyproject.toml`, a task of the unit's own `mise.toml` in any other scope — holding the part's path |

A configuration that joins its parts in code — knip's, Stryker's, syncpack's, dependency-cruiser's — imports `join` from the release's `presets/typescript/join.mjs`, and is the part imports and one call, `join(part, …, { own settings })`: it appends each part's lists to the lists of the parts before it and merges its tables into theirs, so a part only adds, then the project's own settings last. dependency-cruiser's rule against development dependencies in production is built over the development files every part names: a part adds its own forms to that list, a story's say, and never restates another part's rule; the project's own settings add its own, a build tool that never ships say, as `developmentFiles: ['^src/entrypoints/build/']`. `join` reads each part imported as a module: its `default`, its `developmentFiles`, and the settings its `settingsOver` builds over the development files of every part and of the project's own settings, which it joins after the parts like any other; it keeps `developmentFiles` out of the settings it joins, so `join` names no tool's setting.

## The session's check

At session start the hook, and `constitution check` at any time, reads each configuration a tool's template names — at the root of each unit, and in any other folder git tracks — and gives one `wiring` warning to a file that lacks a part it takes, names a part it does not take, or holds a copy whose text, between its two lines, is no longer its part's; what the project keeps outside those lines is its own. A part counts as named only by its path under `.droneey/constitution/` or a pack's folder, and only outside a comment. A tool that no file serves for a unit, and that no file below the unit's folder configures, is `<tool> is wired nowhere for <unit>`: the root needs no file of a tool its packages configure, and a package is wired for a tool wherever the root is. A folder that keeps a tool's configuration of its own and that no path under `packages:` names gets an `unlisted` warning. Each `wiring` warning ends with `run /constitution:ratify`; when the computation itself fails, the digest says once that it cannot check the wiring.

A project that keeps a configuration of its own lowers `configuration-takes-every-part-of-its-blocks` with [an override](../guides/override-a-rule.md) and its reason, for the repository or for one unit.

## Bindings

Beside the parts of each axis, `bindings.yaml` names, for each part, the rules it holds and the settings that hold them:

```yaml
nestjs:
  nestjs-keeps-decorator-metadata: [emitDecoratorMetadata, experimentalDecorators]
```

It is the only place a rule meets its tool; a block never names one.
