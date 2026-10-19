# Contributing

> How the Constitution itself is laid out, changed, checked and released.

## The repository

The repository is a workspace of three packages: `packages/constitution`, the rules and what ships with them; `packages/mutation-check`, which mutates only the lines a change touches, over Stryker in `languages/typescript` and over mutmut in `languages/python`; and `packages/python-check`, which holds the lengths of functions and files, where a relative import may reach and where a package may be imported. Its root holds the workspace — one per language, `package.json` and `pyproject.toml` — the configuration of its tools, `.claude-plugin/marketplace.json`, `constitution.yaml`, `PROJECT.md` and `DECISIONS.md`, the Constitution's own decision log.

`packages/constitution` holds:

| Path | Holds |
|---|---|
| `blocks/core` | What holds for any program, always active: its passport `core.md`, how to use the Constitution, which holds no rule; its chapters in `foundation/`, `architecture/` and `workflow/`, each named for what its rules govern |
| `blocks/domains/<id>`, `blocks/contexts/platforms/<id>`, `blocks/contexts/languages/<id>`, `blocks/implementations/<id>` | The blocks of the other [layers](docs/how-it-works.md#blocks-in-layers), a folder each, laid out as [the block format](docs/reference/block-format.md#a-block-is-a-folder) says |
| `hooks` | `hooks.json` and its scripts, one per [hook](docs/reference/plugin.md#hooks): `session-start.sh` gives the digest, `post-tool-use.sh` names the blocks of a file the agent touches, `user-prompt-submit.sh` and `record-check.sh` note the tree, `stop.sh` is the hand-back gate; `lib/`, the awk programs and `state.sh` they share |
| `skills` | The plugin's [skills](docs/reference/skills.md): `/ratify` and `/amend`, which write a project's files, and `/check`, which reviews its changes |
| `agents` | `reviewer`, which `/check` asks to judge files against the rules that govern them |
| `presets` | The tool configurations that hold rules, a part per block, with the bindings that say which setting holds which rule; [their layout](docs/reference/presets.md#layout) |
| `templates` | What `/ratify` writes from: `constitution.yaml`, `PROJECT.md`, `DECISIONS.md`, and `block/`, its passport `block.md` and a chapter `foundation/chapter.md`, for a block of a project's own pack; `project/<scope>/<block>/`, a project's starter files |
| `tools` | The programs the release archive carries, built by `bun run build` from the other packages and ignored by git: `mutation-check`, `mutmut-check` and `python-check` |
| `.claude-plugin` | The plugin's manifest; the marketplace's sits at the repository's root |
| `src` | The tooling that keeps the blocks sound: `blocks:check`, which reads the package and the repository's README and decision log, and checks a pack against the Constitution with `--base` |
| `tests/e2e` | The end-to-end specs of the presets, the templates and the hooks |
| `vocabulary.yaml` | The words of one meaning the `architecture` and `workflow` axes own — terms, folders of the tree, role suffixes, branch prefixes |
| `.claude/agents/rule-placement.md` | The agent that judges, by meaning, the layer and axis of every rule a change adds or rewrites |

How a block and its rules are written is in [the block format](docs/reference/block-format.md), and where a new rule goes is decided by [its placement](packages/constitution/blocks/core/foundation/placement.md).

## Develop

```bash
mise trust && mise install   # bun, Python and uv, the Python tools of the dev group, and the git hooks
bun install                  # the packages of the workspace
bun run check                # lint, manifests, types, imports, unit and end-to-end tests, mutation, the Python tools' own checks, blocks, secrets, names, unused code, vulnerabilities
bun run build                # build the archive's tools into packages/constitution/tools/, as the release does
claude --plugin-dir packages/constitution   # a session on the working tree's hooks and skills instead of the installed plugin's
```

Here `.droneey/constitution` links to `packages/constitution`, so its sessions read the rules of the working tree as they are. To try unreleased rules in another project, point that project's `.droneey/constitution` at this working tree — `ln -sfn <this repository>/packages/constitution .droneey/constitution` — until its next `mise install` links the pinned release back. The release commit writes the version into `packages/constitution/package.json` and its entry in `bun.lock` and the marketplace's tag together, so none of them is edited by hand.

The end-to-end spec in `packages/constitution/tests/e2e/` builds a plugin root of the hooks, and beside it an archive from fixture blocks — and one from this repository's blocks — links the archive into fixture projects as mise does, and runs the real hook over them. `bun run test` runs the unit specs, then the end-to-end ones, which plain `bun test` skips; `bun run test:hooks` runs the hook's specs alone, in `tests/e2e/hooks/`, and `HOOK_SHELL=/bin/bash bun run test:hooks` runs them under the bash 3.2 macOS ships. `check` runs `test` and `mutation:check` side by side with `bun run --parallel`, each line of their output led by its script's name.

`blocks:check` loads every block and fails on what [the block format](docs/reference/block-format.md#what-the-check-refuses) lists, beside the plugin's manifests, the decision log and the size of core's passport: a broken plugin, marketplace or hooks manifest, a marketplace that serves the plugin other than from its own repository at a release tag, a skill folder without `SKILL.md`, a missing template, a decision log that repeats a number, lets it fall or leaves an entry without its date and status, and a core passport over 3,500 bytes.

## Change it

1. Open an issue, and a branch `feature/`, `fix/` or `hotfix/` with its number.
2. Place each rule a change adds or moves by the three questions of [placement](packages/constitution/blocks/core/foundation/placement.md); the `rule-placement` agent reviews every change to `blocks/` or `presets/`, and its table of answers goes into the pull request.
3. A choice between real alternatives about a rule gets its entry in [`DECISIONS.md`](DECISIONS.md), naming what was rejected and why.
4. `bun run check` passes before the change is handed back.
5. The pull request into `main` is squash-merged; the release follows from the branch's prefix.

## Workflows

| File | Trigger | Does |
|---|---|---|
| `ci-check.yaml` | pull request into `main` | Two jobs side by side: `check` — the project's one check, with the hook under mawk, the build of the archive's tools and the workflow lint; `test:hooks` — a matrix that runs it, the hook's specs alone, under gawk and under macOS's `/bin/bash` 3.2 and system awk |
| `cd-version.yaml` | push to `main`, but for the release commit | Calls `droneey/.github`: bumps `packages/constitution/package.json` and the marketplace's tag from the merged branch prefix and pushes the `vX.Y.Z` tag |
| `cd-pre-release.yaml` | tag `v*` | Calls `droneey/.github`: builds the archive's tools, packs `package.json`, `blocks/`, `presets/`, `templates/`, `vocabulary.yaml` and the built `tools/` of `packages/constitution` into `constitution.tar.gz` with its checksum, and opens the pre-release with its changelog |
