# Choose the blocks

> List what the project has, layer by layer, and give each part of a workspace the blocks of its own.

[`/constitution:ratify`](../reference/skills.md#constitutionratify) proposes the blocks from what the repository holds, each with its evidence, and writes them once you agree. This guide is for checking its proposal and for changing the list later by hand.

## List a block where the project has it

Core is always active. Every other block is listed by its id under its layer:

```yaml
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
  - tanstack-router
  - biome
  - bun
  - git
```

| Key | A block belongs here when the project | Evidence to look for |
|---|---|---|
| `domains` | has that aspect, whatever its technology | a user interface, data fetched over a network, a public API |
| `platforms` | runs there | a browser bundle, a command-line entry point, a server |
| `languages` | is written in it | the source files |
| `implementations` | installs, runs or reaches that library, tool or service | a manifest's dependency, a configuration file |
| `axes` | follows that optional axis | `architecture`, `workflow`, both, or `[]` for neither |

## Let the warnings finish the list

A new session reads `constitution.yaml` and reports what does not hold, at the top of its digest:

| Warning | What to do |
|---|---|
| `missing: A needs B — add B to <key>` | list B as well; a block brings the blocks it requires |
| `unknown: X is not a block — check the name` | correct the id, or [write a block](write-a-pack.md) for it |
| `wrong-key: X is an implementation — move it from languages to implementations` | move the id to its layer's key |
| `abstract: _x cannot be listed — list <heirs>` | list the block that extends it instead |
| `not-met: X does not meet <rule>` | read X's Requirements table: another rule stands in, or the block does not fit |

## Give a part of a workspace its own blocks

In a workspace, a unit adds blocks for the files under its path, on top of the repository's:

```yaml
packages:
  apps/web:
    domains:
      - ui
      - untrusted-client
    platforms:
      - browser
    implementations:
      - react-dom
  apps/api:
    domains:
      - rest-api
    platforms:
      - server
    implementations:
      - nestjs
```

A repository of one unit writes `packages: {}`. [`packages`](../reference/constitution-yaml.md#packages) lists the keys a unit takes, and how its `axes` replace the repository's.

## Check the result

Start a new session: the second line of its [digest](../reference/plugin.md#the-digest) reads `constitution.yaml pins <version>; <n> blocks are active.`, and the warnings follow it. [Every key](../reference/constitution-yaml.md) of the file is in the reference.
