# Contributing

> How the Constitution itself is laid out, changed, checked and released.

## The repository

The repository is a workspace of the site, `apps/docs`, and six packages: `packages/constitution`, the rules and what ships with them; the design system every Droneey interface shares, in three — `packages/design-tokens`, its tokens and the runner that builds each platform's theme from them, `packages/design-cli`, the command line's theme, formatters and components on Ink, and `packages/design-browser`, the site's stylesheets, Tailwind theme and components on React DOM, the two drawn from the first; `packages/mutation-check`, which mutates only the lines a change touches, over Stryker in `languages/typescript` and over mutmut in `languages/python`; and `packages/python-check`, which holds the lengths of functions and files, where a relative import may reach and where a package may be imported. Its root holds the workspace — one per language, `package.json` and `pyproject.toml` — the configuration of its tools, `.claude-plugin/marketplace.json`, `constitution.yaml`, `PROJECT.md` and `DECISIONS.md`, the Constitution's own decision log. Each package keeps a `constitution.yaml` of its own beside its tools' configurations, with every block it follows, the root's among them.

`packages/constitution` holds:

| Path | Holds |
|---|---|
| `blocks/core` | What holds for any program, always active: its passport `core.md`, how to use the Constitution, which holds no rule; its chapters in `foundation/`, `architecture/` and `workflow/`, each named for what its rules govern |
| `blocks/domains/<id>`, `blocks/contexts/platforms/<id>`, `blocks/contexts/languages/<id>`, `blocks/implementations/<id>` | The blocks of the other [layers](docs/how-it-works.md#blocks-in-layers), a folder each, laid out as [the block format](docs/reference/block-format.md#a-block-is-a-folder) says |
| `hooks` | `hooks.json` and `hook.sh`, which hands each [hook](docs/reference/plugin.md#hooks)'s event to `constitution hook <event>`, or says in one line that the program is missing |
| `skills` | The plugin's [skills](docs/reference/skills.md): `/ratify` and `/amend`, which write a project's files, and `/check`, which reviews its changes |
| `agents` | `reviewer`, which `/check` asks to judge files against the rules that govern them |
| `presets` | The tool configurations that hold rules, a part per block, with the bindings that say which setting holds which rule; [their layout](docs/reference/presets.md#layout) |
| `templates` | What `/ratify` writes from: `constitution.yaml`, `PROJECT.md`, `DECISIONS.md`, and `block/`, its passport `block.md` and a chapter `foundation/chapter.md`, for a block of a project's own pack; `project/<scope>/<block>/`, the fragment of each block's own of the files it gives a project, the configuration of each tool with presets among them |
| `tools` | The programs the release archive carries, built by `bun run build` from the other packages and ignored by git: `mutation-check`, `mutmut-check` and `python-check` |
| `.claude-plugin` | The plugin's manifest; the marketplace's sits at the repository's root |
| `src` | The `constitution` program, a command line on commander, drawn by `@droneey/design-cli` — Ink on a terminal, plain text elsewhere — and laid out by features: `blocks check`, which checks the blocks, reading the package and the repository's README and decision log, a pack against the Constitution with `--base`; `presets check` and `presets plan`, the project's declaration and wiring, and the parts each unit takes for `/ratify`; `check`, both in turn; `doctor`, how the installation stands; and `hook <event>`, the hooks' digest, reminders and hand-back gate. `src/entrypoints/cli-build` compiles it, the React Compiler over its components and the design system's, with a hash of the plugin's own files built in for `doctor` to compare the installed plugin's with; run from the sources, the program hashes the working tree's |
| `tests/e2e` | The end-to-end specs of the presets, the templates and the hooks |
| `.claude/agents/rule-placement.md` | The agent that judges, by meaning, the layer and axis of every rule a change adds or rewrites |

How a block and its rules are written is in [the block format](docs/reference/block-format.md), and where a new rule goes is decided by [its placement](packages/constitution/blocks/core/foundation/placement.md).

## Develop

```bash
mise trust && mise install   # bun, Python and uv, the Python tools of the dev group, and the git hooks
bun install                  # the packages of the workspace
bun run check                # lint, manifests, types, imports, unit and end-to-end tests, mutation, the Python tools' own checks, blocks, secrets, names, unused code, vulnerabilities
bun run build                # build the archive's tools into packages/constitution/tools/, as the release does
bun run build:cli            # build the constitution program for this machine into dist/cli/constitution, the React Compiler over its components; --target bun-<os>-<arch> and --outfile <path> build another, as the release does for each platform
claude --plugin-dir packages/constitution   # a session on the working tree's hooks and skills instead of the installed plugin's
```

`mise install` also runs `bun link` in `packages/constitution`, which puts `constitution` into `~/.bun/bin`, on `PATH`: the hooks of every session, here or in another project, run the working tree's sources, with no build between an edit and the next hook. A project that pins a release runs that release's compiled program instead, which mise puts first on its `PATH`.

Here `.droneey/constitution` links to `packages/constitution`, so its sessions read the rules of the working tree as they are. To try unreleased rules in another project, point that project's `.droneey/constitution` at this working tree — `ln -sfn <this repository>/packages/constitution .droneey/constitution` — until its next `mise install` links the pinned release back. The release commit writes the version into `packages/constitution/package.json` and its entry in `bun.lock` and the marketplace's tag together, so none of them is edited by hand.

The end-to-end spec in `packages/constitution/tests/e2e/` compiles the program once with `build:cli`, as the release does, builds a plugin root of the hooks, and beside it an archive from fixture blocks — and one from this repository's blocks — links the archive into fixture projects as mise does, and runs the real hook over them with the program on its `PATH`. `bun run test` runs the unit specs, then the end-to-end ones, which plain `bun test` skips; `bun run test:hooks` runs the hook's specs alone, in `tests/e2e/hooks/`, and `HOOK_SHELL=/bin/bash bun run test:hooks` runs them under the bash 3.2 macOS ships. `check` runs `test` and `mutation:check` side by side with `bun run --parallel`, each line of their output led by its script's name.

`blocks:check` runs `constitution check` in `packages/constitution`: the blocks, then the repository's own declaration and wiring. It loads every block and fails on what [the block format](docs/reference/block-format.md#what-the-check-refuses) lists, beside the plugin's manifests, the decision log and the size of core's passport: a broken plugin, marketplace or hooks manifest, a marketplace that serves the plugin other than from its own repository at a release tag, a skill folder without `SKILL.md`, a missing template, a tool's presets without a template that takes them, a decision log that repeats a number, lets it fall or leaves an entry without its date and status, and a core passport over 3,500 bytes.

## Change it

1. Open an issue, and a branch `feature/`, `fix/` or `hotfix/` with its number.
2. Place each rule a change adds or moves by the three questions of [placement](packages/constitution/blocks/core/foundation/placement.md); the `rule-placement` agent reviews every change to `blocks/` or `presets/`, and its table of answers goes into the pull request.
3. A choice between real alternatives about a rule gets its entry in [`DECISIONS.md`](DECISIONS.md), naming what was rejected and why.
4. `bun run check` passes before the change is handed back.
5. The pull request into `main` is squash-merged; the release follows from the branch's prefix.

## Workflows

| File | Trigger | Does |
|---|---|---|
| `ci-check.yaml` | pull request into `main` | Two jobs side by side: `check` — the project's one check, the build of the archive's tools and the workflow lint; `test:hooks` — the hook's specs alone, under macOS's `/bin/bash` 3.2 |
| `cd-version.yaml` | push to `main`, but for the release commit | Calls `droneey/.github`: bumps `packages/constitution/package.json` and the marketplace's tag from the merged branch prefix and pushes the `vX.Y.Z` tag |
| `cd-pre-release.yaml` | tag `v*` | Calls `droneey/.github`: builds the archive's tools, packs `package.json`, `blocks/`, `presets/`, `templates/` and the built `tools/` of `packages/constitution` into `constitution.tar.gz` with its checksum, compiles the `constitution` program for Linux, macOS and Windows into `constitution-<os>-<arch>.tar.gz`, each holding `bin/constitution`, and opens the pre-release with its changelog and these assets |
