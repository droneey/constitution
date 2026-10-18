# constitution.yaml

> The file at a project's root that names the release it follows, its blocks, its check and its overrides.

```yaml
version: 0.70.0
axes:
  - architecture
  - workflow
domains:
  - ui
  - remote-data
  - version-control
platforms:
  - browser
languages:
  - typescript
  - css
implementations:
  - react-dom
  - biome
  - bun
  - git
packages: {}
packs:
  - constitution
check: bun run check
overrides: []
```

Every key but `packs` is required; a missing or an unknown key is a warning in the digest. `/constitution:ratify` writes them in this order.

## Keys

| Key | Holds | Empty |
|---|---|---|
| `version` | the release the project pins, as in `mise.toml` | — |
| `axes` | the optional axes it follows: `architecture`, `workflow`; the base is always followed | `[]`, the base alone |
| `domains` | the ids of its domain blocks | `[]` |
| `platforms` | the ids of its platform blocks | `[]` |
| `languages` | the ids of its language blocks | `[]` |
| `implementations` | the ids of its library, tool and service blocks | `[]` |
| `packages` | the units of a workspace, each with blocks of its own | `{}` |
| `packs` | the folders of blocks it follows beside the Constitution's, relative to the root | left out |
| `check` | the command that runs every check | `null` |
| `overrides` | the rules it lowers | `[]` |

Core is never listed: it is always active. An abstract block, whose id starts with `_`, is never listed either; the blocks that extend it are.

## version

The release whose rules the project follows. [Upgrade](../guides/upgrade.md) raises it.

## axes

The axes beside the base: `architecture` for the program's tree and seams, `workflow` for how a change travels to a release. [Three axes](../how-it-works.md#three-axes) tells them apart.

## domains

The aspects the project has whatever its technology: a user interface, data fetched over a network, a public API. [The domains](../../packages/constitution/blocks/domains) are the blocks to list.

## platforms

Where the project runs: a browser, a server, a command line. [The platforms](../../packages/constitution/blocks/contexts/platforms) are the blocks to list.

## languages

What the project is written in. [The languages](../../packages/constitution/blocks/contexts/languages) are the blocks to list.

## implementations

The libraries, tools and services the project installs, runs or reaches. [The implementations](../../packages/constitution/blocks/implementations) are the blocks to list, and [Choose the blocks](../guides/choose-blocks.md) says how to find each layer's.

## packages

Each unit is a path, two spaces in; its keys sit four spaces in and add to the repository's for the files under that path:

```yaml
packages:
  apps/web:
    axes:
      - architecture
    domains:
      - ui
      - untrusted-client
    platforms:
      - browser
    implementations:
      - react-dom
    overrides: []
```

A unit takes `axes`, `domains`, `platforms`, `languages`, `implementations` and `overrides`. Its `axes` replace the repository's; without them it follows the repository's.

## packs

The folders of blocks the project follows beside the Constitution's: its own pack, and those it shares with other projects. [Write a pack](../guides/write-a-pack.md) shapes one.

## check

The one command that runs every tool; the hand-back waits until it passes. [Run the check in CI](../guides/check-in-ci.md) runs it on every pull request.

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
| `level` | `SHOULD` or `MAY`, lower than the rule's own |
| `reason` | one line, in double quotes |
| `until` | optional; a date, `YYYY-MM-DD`, after which the override lowers nothing |

[Override a rule](../guides/override-a-rule.md) explains what an override does.

## The YAML it reads

The plugin reads the file with no YAML library, so it takes a plain subset:

- block lists of `- item`, and flow lists, `[a, b]`, which may run over several lines — the yamllint preset forbids flow lists, so a project that runs it writes block lists, as the examples here do;
- quotes around a value that holds `:` or `#`;
- no anchors, tags, multi-line strings or nested `{` and `[`, and no tabs in the indentation.

A file that does not parse leaves only core active, and the digest names the line.
