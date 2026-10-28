# Contributing

> How a change to the Constitution is made, checked and released.

Every change starts from an issue and reaches `main` through a pull request, as [the fleet's contribution conventions](https://github.com/droneey/.github/blob/main/CONTRIBUTING.md) say: the branch, the commit and the merge. A vulnerability is reported as [the security policy](SECURITY.md) says, never in an issue.

## Set up

```bash
mise trust && mise install   # the pinned toolchain, the Python tools and the git hooks
bun install                  # the packages of the workspace
claude --plugin-dir packages/constitution   # a session on the working tree's hooks and skills
```

`mise install` also links `constitution` from its sources into `~/.bun/bin`, so the hooks of every session run the working tree with no build between an edit and the next hook. Here `.droneey/constitution` links to `packages/constitution`, so this repository's sessions read the rules as they are; to try unreleased rules in another project, point its `.droneey/constitution` at this working tree with `ln -sfn <this repository>/packages/constitution .droneey/constitution`, until its next `mise install` links its pinned release back.

## Check

`bun run constitution run check` is the one check, the tool from its sources running every unit's checks, and it passes before a change is handed back; a pull request runs the same, and runs the executable's specs, `bun run --cwd packages/constitution executable:test`, on each platform the release ships. `bun run constitution run test` runs the specs alone, and `bun run --cwd packages/constitution build` builds the executable for this machine into `packages/constitution/dist/cli/constitution`.

## Change a rule

1. Place each rule a change adds or moves by the three questions of [placement](packages/constitution/blocks/core/foundation/placement.md), and write it in [the block format](docs/reference/block-format.md).
2. The `rule-placement` agent reviews every change to `blocks/` or `presets/`; its table goes into the pull request, and each of its findings is fixed or answered there.
3. A choice between real alternatives about a rule gets its entry in [`DECISIONS.md`](DECISIONS.md), naming what was rejected and why.

[How it works](docs/how-it-works.md) maps the blocks, the presets, the templates and the executable that checks them.

A change to a preset file touches the `constitution.lock` of every unit it reaches: run `bun run ./packages/constitution/src/main.ts presets apply` from the root and commit what it writes, and resolve a conflict between locks by running it again on the merged tree.

## Release

A merged branch's prefix sets the next version, and the merge tags it; the tag opens a pre-release with the Constitution's distribution for each platform attached, its content and that platform's executable, which the owner promotes by hand. The release commit writes every version, so none is edited by hand.
