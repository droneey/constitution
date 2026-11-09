# constitution.yaml

> The file at a project's root, and in each member of its workspace, that names its package, its blocks, its packs and its overrides.

```yaml
name: '@acme/web'
axes:
  - architecture
  - workflow
domains:
  - presentation
  - integrations/remote-data
  - transports
  - version-control
platforms:
  - client/browser
languages:
  - typescript
  - css
  - html
  - json
  - toml
implementations:
  - react/react-dom
  - tanstack-router
  - biome
  - js-runtime/bun
  - task-runner
  - git
packs:
  - pack
overrides: []
```

Every key but `name` is required; a missing or an unknown key is a warning in the digest. `/constitution:ratify` writes them all, `name` included, in this order. A member of a workspace keeps a file of its own, of the same keys: [members of a workspace](#members-of-a-workspace). The check is no key: the runner blocks give it, and `constitution run check` runs it; [Run the check in CI](../guides/check-in-ci.md) runs it on every pull request.

## Keys

| Key | Holds | Empty |
|---|---|---|
| `name` | the name of its package, as its manifest gives it | left out |
| `axes` | the optional axes it follows: `architecture`, `workflow`; `foundation` is always followed | `[]`, `foundation` alone |
| `domains` | the ids of its domain blocks | `[]` |
| `platforms` | the ids of its platform blocks | `[]` |
| `languages` | the ids of its language blocks | `[]` |
| `implementations` | the ids of its library, tool and service blocks | `[]` |
| `packs` | the folders of blocks it follows beside the Constitution's, relative to the file's folder | `[]` |
| `overrides` | the rules it lowers | `[]` |

A block is listed by its id, its path among the blocks of its rank: `react/react-dom`, `client/browser`, `integrations/remote-data`. A listed block turns on every block it sits under, so `react/react-dom` brings `react`, and `integrations/remote-data` brings `integrations`; the blocks a block requires are listed too, and the digest names each one missing. Core is never listed: it is always active.

## name

The name of the unit's package, as its `package.json` or `pyproject.toml` gives it, read verbatim; a name that opens with `@` is quoted, `name: '@acme/web'`. It is the one key a file may leave out without a warning.

## axes

The axes beside `foundation`: `architecture` for the program's tree and seams, `workflow` for how a change travels to a release. [Three axes](../how-it-works.md#three-axes) tells them apart.

## domains

The aspects the project has whatever its technology: a user interface, data fetched over a network, a public API, as `presentation`, `integrations/remote-data` and `contracts/api` are. [The domains](../../packages/constitution/blocks/domains) are the blocks to list.

## platforms

Where the project runs: a browser, a server, a command line, as `client/browser`, `server` and `client/cli` are. [The platforms](../../packages/constitution/blocks/contexts/platforms) are the blocks to list.

## languages

What the project is written in. [The languages](../../packages/constitution/blocks/contexts/languages) are the blocks to list.

## implementations

The libraries, tools and services the project installs, runs or reaches. [The implementations](../../packages/constitution/blocks/implementations) are the blocks to list, and [Choose the blocks](../guides/choose-blocks.md) says how to find each rank's.

## packs

The folders of blocks the project follows beside the Constitution's: its own pack, and those it shares with other projects. [Write a pack](../guides/write-a-pack.md) shapes one.

## overrides

```yaml
overrides:
  - rule: data-view-shows-every-state
    level: SHOULD
    reason: "The admin screens show their state in the shared toolbar"
    until: 2026-12-31
```

| Field | Holds |
|---|---|
| `rule` | the slug of a rule of the Constitution |
| `level` | `SHOULD` or `MAY`, lower than the rule's own: `SHOULD` or `MAY` for a `MUST`, `MAY` for a `SHOULD`; a rule set to `MAY` only advises |
| `reason` | one line, in double quotes |
| `until` | optional; a date, `YYYY-MM-DD`, after which the override lowers nothing |

`MAY` is a level only an override names: no rule's heading states it. An override never turns a rule off.

[Override a rule](../guides/override-a-rule.md) explains what an override does.

## Members of a workspace

Each member of the workspace keeps a `constitution.yaml` in its own folder, with the keys of the root's, its own `name` among them:

```yaml
name: '@acme/admin'
axes:
  - architecture
domains:
  - presentation
  - version-control
platforms:
  - client/browser
languages:
  - typescript
  - html
implementations:
  - react/react-dom
  - biome
  - js-runtime/bun
  - task-runner
  - git
packs: []
overrides: []
```

The members are the folders the workspace declares: the globs of `workspaces` in the root's `package.json` that reach a folder holding a `package.json`, and those of `members` of `[tool.uv.workspace]` in the root's `pyproject.toml` that reach a folder holding a `pyproject.toml`; a glob after `!`, or under uv's `exclude`, leaves its folders out. Nothing passes from one file to another: a member follows only the axes, blocks, packs and overrides its own file lists, so it names the repository's blocks it follows too, and lists a pack by its path from its own folder. The root's file covers the files no member holds.

A member with no `constitution.yaml` is a `workspace` warning, and one whose file cannot be read or does not parse a `config` warning, in the digest and in `constitution presets check`; either way its files follow no block. A `packages` key, which listed the members' blocks in the root's file before, is a warning too: each member's blocks go into its own file.

The project is the farthest folder with a `constitution.yaml`, up to the root of its repository, from where a session starts or a command runs.

## The YAML it reads

The file is YAML 1.2, read by its core schema, and each value reads where it is written:

- lists are block lists of `- item` or flow lists, `[a, b]`; the yamllint preset forbids flow lists, so a project that runs it writes block lists, as the examples here do;
- a value that holds `:` or `#` is quoted, and so is a name that opens with `@`;
- an anchor, an alias, a tag or a block scalar, `|` or `>`, makes the file fail to parse.

A file that does not parse leaves only core active, and the digest names its lines.
