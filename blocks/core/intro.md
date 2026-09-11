# The Constitution — start here

> The rules every droneey repository is built by. They are split into **blocks**, each owning one axis of how we build, and a project takes exactly the blocks that apply to it through a named **assembly**. Read this chapter first: it says how the pieces fit, in what order to read them, and what wins when two rules meet.

---

## 1. What governs a project

- **The assembly** the project names in its `PROJECT.md`: an ordered list of blocks. The `core` block is part of every assembly and is never listed.
- **`PROJECT.md`**, committed at the root of the repository: the product context, plus the pin of the constitution version and the assembly.
- **`DECISIONS.md`**, committed at the root: the project's own decision log. A departure from a block is recorded there, never applied silently.
- **The plugin**, installed once per machine: at every session start it reads `PROJECT.md` and, when it names an assembly, puts this chapter, the assembly and the manifests of its blocks into the agent's context. A project carries no agent file of its own.

No file in a project restates a rule; the plugin brings the rules in. **Any agent or human works from these documents.**

---

## 2. How to use it

1. Find the assembly in `PROJECT.md`, open it under `assemblies/`, and read the summary of every block it lists.
2. **Before writing or moving code, read the chapter that governs what you are about to do:** `architecture` before a module moves, `code` before a line is written, `ui` before a component, `workflow` before every change. The rules are binding defaults.
3. **Deviation requires explicit, per-change human consent,** recorded in the change itself and in `DECISIONS.md` with a `Deviates:` line. No blanket waivers.
4. **When two rules seem to conflict,** apply the precedence of §5.
5. **If a situation isn't covered,** derive the answer from the nearest principle. A real gap is an amendment to the block at its source — never a local convention.

---

## 3. Blocks

A block is a folder under `blocks/<kind>/<name>/` holding a manifest, `block.yml`, and one markdown chapter per axis it governs.

| Kind | Governs | Examples |
| --- | --- | --- |
| `core` | what holds for any software in any language | principles, workflow, testing, security, collaboration |
| `language` | how code is written in one language | `typescript` |
| `concern` | one cross-cutting concern several kinds of application share | `ui` |
| `sphere` | the anatomy and laws of one kind of application | `client`, `web`, `mobile`, `cli`, `api` |
| `framework` | the discipline of one framework | `react` |
| `stack` | the toolbox and its binding to the architecture, named after its platform layer | `tanstack-spa`, `expo`, `bun` |

The order of the table is the order of the kinds: a block depends only on blocks of its own kind or of a kind above it (§6).

The manifest is the block's interface:

```yaml
kind: sphere
name: web
summary: >-
  One paragraph a reader uses to decide whether the block matters for the task.
requires: [spheres/client, concerns/ui]   # blocks that must be in the same assembly
refines: [spheres/client, concerns/ui]    # blocks whose chapters this block tightens
chapters:
  architecture: architecture.md
  ui: ui.md
```

- `requires` names what the block assumes; an assembly that lists the block lists these too.
- `refines` names what the block tightens. A refining block adds rules and narrows choices; it never loosens or contradicts.
- A chapter is one axis: `architecture`, `code`, `ui`, `framework`, `stack` — and, in `core` only, `principles`, `workflow`, `testing`, `security`, `collaboration`.
- A chapter stays **under 500 lines**. One that outgrows the budget becomes a folder with an `index.md` map and one file per section; the manifest points at the folder.

---

## 4. Assemblies

An assembly is a named, ordered list of blocks under `assemblies/`:

```yaml
name: web-react-tanstack
sphere: web
blocks:
  - languages/typescript
  - concerns/ui
  - spheres/client
  - spheres/web
  - frameworks/react
  - stacks/tanstack-spa
```

The order is the reading order and the precedence order: a later block refines an earlier one. Every `requires` of every listed block is listed; every `refines` target comes earlier in the list. A project names exactly one assembly; a repository with several applications names one per application.

---

## 5. Precedence

1. **A rule a tool enforces wins over prose.** The linter, the dependency checker, the hooks, the lockfile and the coverage gate are the constitution's executable half; a chapter never restates what they already hold.
2. **Within one axis, the more specific block wins, and it may only tighten:** a sphere over the concern it refines, a stack over the framework it binds, the project's own recorded decisions over everything — each inside the consent rule of §2.
3. **Across axes, structure wins:** the `architecture` chapters of the assembly are the law; every other chapter binds to them.

---

## 6. The dependency rule for documents

Blocks depend inward, like code. A chapter refers only to a block of its own kind or of a kind above it in the table of §3, and only by the name of the concern, never by brand: `core` names no language, a language names no concern, a concern names no sphere, a sphere names no framework or tool, a framework names no stack. The only places a lower block is named are the manifests and the table of kinds in §3. Code blocks may illustrate with the default stack; prose may not.

`DECISIONS.md` refers to chapters; chapters never cite decisions by number. A block therefore copies into any assembly without dangling into one history.

---

## 7. Enforcement, in one line

Whatever can be expressed as a check lives in a tool — dependency boundaries in the dependency checker, style in the linter, the commit format in the hooks, the runner in the lockfile, the coverage gate in the test runner's configuration. The chapters carry only what tools can't express, written as real rules, not decoration. **A rule a tool already enforces is not repeated here as prose; a rule no tool can enforce is written here as a real rule.**

---

## 8. Amendments and versions

The constitution is versioned by tags. A project pins the version in `PROJECT.md` and upgrades by bumping the pin and passing a conformance pass against the chapters that changed; the plugin says at session start when the pin and the installed version differ.

An amendment is a pull request against the block at its source, shipped together with its entry in the constitution's own `DECISIONS.md`. A project never edits a block. A project-local departure is an entry in the project's `DECISIONS.md` with a `Deviates:` line naming the chapter and section — the only way a project departs.

---

## 9. Reading order

- **New to the fleet:** this chapter → `principles` → `workflow` → `collaboration` → the assembly's chapters in list order.
- **Doing a task:** the chapter of its axis, plus `architecture` whenever structure changes.
- **About to change something that looks deliberate:** the project's `DECISIONS.md` first, then the constitution's.
