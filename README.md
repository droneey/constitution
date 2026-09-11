# constitution

The engineering constitution of droneey: the rules every repository is built by, split into **blocks** and assembled per project. A project commits two files, `PROJECT.md` and `DECISIONS.md`, and names the **assembly** that governs it; everything else lives here, versioned by tags and pinned by the project.

Start with [`blocks/core/intro.md`](blocks/core/intro.md).

## 📦 Layout

| 📂 Path | 🧩 Holds |
|---|---|
| `blocks/core` | The laws for any software: principles, workflow, testing, security, collaboration; the `ratify` and `amend` skills |
| `blocks/languages` | How code is written in one language — `typescript` |
| `blocks/spheres` | The anatomy of one kind of application — `client`, `web`, `mobile`, `cli` |
| `blocks/concerns` | One cross-cutting concern — `ui` |
| `blocks/frameworks` | The discipline of one framework — `react` |
| `blocks/stacks` | A toolbox and its binding — `tanstack-spa`, `expo`, `bun` |
| `assemblies` | Named, ordered lists of blocks a project can pin |
| `templates` | The `PROJECT.md` and `DECISIONS.md` a project starts from |
| `hooks` | The session-start hook that puts the constitution into context |
| `.claude-plugin` | The plugin and marketplace manifests |
| `scripts/blocks-check` | The check that keeps the manifests, assemblies and chapters sound |
| `DECISIONS.md` | The constitution's own decision log |

A block is a folder with a `block.yml` manifest — kind, summary, `requires`, `refines`, chapters — and one markdown chapter per axis it governs. Only stack chapters name brands; every other chapter names concerns.

## 🧩 Assemblies

| Assembly | Blocks | State |
|---|---|---|
| `web-react-tanstack` | typescript · ui · client · web · react · tanstack-spa | complete |
| `mobile-react-expo` | typescript · ui · client · mobile · react · expo | skeleton — `mobile` and `expo` carry `TODO:` until the first mobile project |
| `cli-bun` | typescript · cli · bun | complete |

## 🔌 Install

The constitution is a Claude Code plugin served from this repository. Once per machine:

```bash
claude plugin marketplace add droneey/constitution
```

```bash
claude plugin install constitution@droneey
```

`claude plugin marketplace update` pulls a newer version. From then on, every session opened in a repository whose `PROJECT.md` names an assembly starts with the `intro` chapter, the assembly and its blocks in context, and the skills `/ratify` and `/amend` are available.

## 🚀 Using it in a project

1. Run `/ratify` in the repository: it interviews you, writes `PROJECT.md` with the pin and the assembly, and `DECISIONS.md` beside it. By hand, the same two files start from `templates/`.
2. Read the blocks in the assembly's order; before a change, read the chapter of its axis.
3. A departure from a block is a `DECISIONS.md` entry with a `Deviates:` line — `/amend` writes one — never a silent divergence, never an edit to a block.

The recipes of the client sphere follow as skills in later releases.

## 🛠️ Development

```bash
mise trust && mise install   # bun, node
bun install                  # installs the git hooks
bun run check                # lint, package manifests, types, tests with the coverage gate, then the blocks check
```

`blocks:check` reads every `block.yml` and assembly and fails on: a manifest that does not match the schema or its folder; a chapter or template file that is missing; an assembly that lists an unknown block, lists one twice, lists core, misses a `requires`, or lists a `refines` target after its refiner; a block that depends on a kind below its own; a chapter over 500 lines or without a title; a link to a missing file; a chapter that names a lower block in prose; a decision log that skips or repeats a number.

## ⚙️ Workflows

| 📄 File | ⚡ Trigger | 🎯 Does |
|---|---|---|
| `ci-check.yml` | pull request into `main` | Lint, types, tests, the blocks check, the workflow lint |
| `cd-version.yml` | push to `main` | Calls `droneey/.github`: bumps `package.json` from the merged branch prefix and pushes the `vX.Y.Z` tag |
| `cd-pre-release.yml` | tag `v*` | Calls `droneey/.github`: opens the pre-release with its changelog |

Every constitution version a project pins is one of those tags.

## 🛠️ Changing it

- Every change lands through a pull request into `main`, squash-merged, with its entry in `DECISIONS.md` when it is a decision.
- A chapter stays under 500 lines and refers only to blocks of its own kind or above, by concern.
- Adding a sphere, framework or stack is adding a folder and, when a project needs it, an assembly; the core is untouched.

## 📄 License

Private. All rights reserved.
