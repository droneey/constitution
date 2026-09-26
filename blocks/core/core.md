---
id: core
kind: core
summary: What holds for any program, in any language, of any kind.
chapters: [principles.md, architecture.md, code.md, testing.md, security.md]
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# The droneey constitution

The rules a droneey repository is built by. The digest at session start lists the active blocks and their files; the files hold the rules, so read the ones that govern the work.

## How to use it

1. Before a change, read core's chapters and the files of the blocks that govern it. Before handing the work back, check it against every active rule, not only those the task seemed to touch.
2. A rule is a heading `<slug> · <level>` with its Why, Check and Tags. MUST binds. SHOULD is the default; not following it needs a stated reason. MAY is a permitted choice.
3. A request against a MUST is answered with the conflict and an alternative, never obeyed silently.
4. A case no rule covers follows the nearest principle. A real gap is amended in the constitution or written as a local block, never kept as a silent habit.

## Precedence

1. An override in `constitution.yaml` is stronger than any rule, core included. It is written only with the user's consent in the chat, for that override, with its reason.
2. Otherwise the more specific layer wins: implementations, then contexts (platforms and languages), then domains, then core. A block tightens what is above it, never loosens it.
3. A clash between a platform and a language means the rule is misplaced; it moves to an implementation or to the project.

## Where a rule goes

Ask what must disappear for the rule to lose its meaning. Nothing: core. An interface, an API, a network: that domain. A runtime or a language: that context. A library: its block.

## A library with no block

Apply the rules of the project's domains and language to it directly, and check it against their requirements for implementation. Report every MUST it cannot meet, and propose a local block for it, marked `status: draft`. Never break a rule silently.

## The project's files

- `constitution.yaml`: the pinned version, the blocks the project follows, its applications, its check command and its overrides.
- `PROJECT.md`: what the product is and for whom, its entities, its boundaries and its glossary.
- `rules/`: the project's local blocks.

## Reading order

This file, then `principles`, then the chapter of the task: `architecture` before structure changes, `code` before code is written, `testing` with every behaviour, `security` for dependencies and secrets, `workflow` for every change, `collaboration` when working with people and agents. Then the active blocks, from domains to implementations.
