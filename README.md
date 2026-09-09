# constitution

The engineering constitution of droneey: the rules every repository is built by, split into **blocks** and assembled per project. A project commits two files, `PROJECT.md` and `DECISIONS.md`, and names the **assembly** that governs it; everything else lives here, versioned by tags and pinned by the project.

Start with [`blocks/core/intro.md`](blocks/core/intro.md).

## 📦 Layout

| 📂 Path | 🧩 Holds |
|---|---|
| `blocks/core` | The laws for any software: principles, workflow, testing, security, collaboration; the `PROJECT.md` and `DECISIONS.md` templates |
| `blocks/languages` | How code is written in one language — `typescript` |
| `blocks/spheres` | The anatomy of one kind of application — `client`, `web`, `mobile`, `cli` |
| `blocks/concerns` | One cross-cutting concern — `ui` |
| `blocks/frameworks` | The discipline of one framework — `react` |
| `blocks/stacks` | A toolbox and its binding — `tanstack-spa`, `expo`, `bun-cli` |
| `assemblies` | Named, ordered lists of blocks a project can pin |
| `DECISIONS.md` | The constitution's own decision log |

A block is a folder with a `block.yml` manifest — kind, summary, `requires`, `refines`, chapters — and one markdown chapter per axis it governs. Only stack chapters name brands; every other chapter names concerns.

## 🧩 Assemblies

| Assembly | Blocks | State |
|---|---|---|
| `web-react-tanstack` | typescript · client · ui · web · react · tanstack-spa | complete |
| `mobile-react-expo` | typescript · client · ui · mobile · react · expo | skeleton — `mobile` and `expo` carry `TODO:` until the first mobile project |
| `cli-bun` | typescript · cli · bun-cli | complete |

## 🚀 Using it in a project

1. Write `PROJECT.md` from `blocks/core/templates/PROJECT.md` — the generator in `project-generator.md` says how — and pin the constitution tag and the assembly in its front matter.
2. Copy `blocks/core/templates/DECISIONS.md` as the project's `DECISIONS.md`.
3. Read the blocks in the assembly's order; before a change, read the chapter of its axis.
4. A departure from a block is a `DECISIONS.md` entry with a `Deviates:` line — never a silent divergence, never an edit to a block.

The per-machine delivery — one clone at a fixed path and the pointer files for agent tooling — and the skills built on the chapters follow in later releases.

## 🛠️ Changing it

- Every change lands through a pull request into `main`, squash-merged, with its entry in `DECISIONS.md` when it is a decision.
- A chapter stays under 500 lines and refers only to blocks of its own kind or above, by concern.
- Adding a sphere, framework or stack is adding a folder and, when a project needs it, an assembly; the core is untouched.

## 📄 License

Private. All rights reserved.
