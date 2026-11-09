# Choose the blocks

> List what the project has, rank by rank, and give each part of a workspace the blocks of its own.

[`/constitution:ratify`](../reference/skills.md#constitutionratify) proposes the blocks from what the repository holds, each with its evidence, and writes them once you agree. This guide is for checking its proposal and for changing the list later by hand.

## List a block where the project has it

Core is always active. Every other block is listed by its id under the key of its rank:

```yaml
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
```

| Key | A block belongs here when the project | Evidence to look for |
|---|---|---|
| `domains` | has that aspect, whatever its technology | a user interface, data fetched over a network, a public API |
| `platforms` | runs there | a browser bundle, a command-line entry point, a server |
| `languages` | is written in it, or keeps files in its format | the source files, and files such as `.json`, `.toml`, `.html` or a `Dockerfile` |
| `implementations` | installs, runs or reaches that library, tool or service | a manifest's dependency, a configuration file |
| `axes` | follows that optional axis | `architecture`, `workflow`, both, or `[]` for neither |

## List the narrowest block that fits

A block may hold child blocks, each a narrower case of it: `react` holds `react/react-dom`, `react/react-native` and `react/ink`; `client` holds `client/browser`, `client/cli` and `client/mobile`. A child's id is its path, and listing it turns on every block it sits under, so a project that renders React in a browser lists `react/react-dom` and gets `react`'s rules with it. List the parent alone only when no child fits.

The blocks a listed block requires are not turned on with it: list them too. A block's passport names them under `requires`, and the digest names each one missing.

## Let the warnings finish the list

A new session reads `constitution.yaml` and reports what does not hold, at the top of its digest. Each warning opens with the subject to fix: `config` for the file's keys, `blocks` for the ids it lists, `requirements` for the blocks a listed block requires, `overrides`, `workspace` for its members, `installation` for what mise installs, `configurations` for a tool's configuration, and `packs` or `constitution` for a file of a pack or of the release. Those that finish the list:

| Warning | What to do |
|---|---|
| `requirements: A needs B — add B to <key>` | list B as well |
| `requirements: A needs B — add B or B/c to <key>` | list B, or one of its children, which turns B on |
| `blocks: X is not a block — check the name` | correct the id, or [write a block](write-a-pack.md) for it |
| `blocks: X is an implementation — move it from languages to implementations` | move the id to the key of its rank |
| `configurations: <file>: lacks <setting>, as the presets give them — run constitution presets apply [missing]` | run `constitution presets apply`, which writes [the presets' settings](../reference/presets.md#what-a-unit-takes) into the file |

## Give a part of a workspace its own blocks

In a workspace, each member keeps a `constitution.yaml` of its own, in its folder, with the blocks its files follow — the repository's it shares among them, since nothing passes from the root's file to a member's:

```yaml
axes:
  - architecture
  - workflow
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

A member's file takes the keys of the root's. The members are the folders the root's `package.json` and `pyproject.toml` declare as its workspace; [members of a workspace](../reference/constitution-yaml.md#members-of-a-workspace) says how they are found.

## Check the result

Start a new session: the digest names the release, then core's passport, then the active blocks, a line for each rank, and a line for each member whose own file adds blocks or leaves some out; the warnings follow them. `constitution presets check` gives the same warnings outside a session. [Every key](../reference/constitution-yaml.md) of the file is in the reference.
