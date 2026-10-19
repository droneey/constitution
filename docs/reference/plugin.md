# The plugin

> The engine of the Constitution in Claude Code: three skills, a reviewer and the hooks. The rules themselves come from the project's release.

## Skills

Each skill is called by its slash command:

- `/constitution:ratify`, by you only, puts a repository under the Constitution;
- `/constitution:amend`, by you only, adds, changes or removes an override;
- `/constitution:check`, by you or the agent, runs the check and has the reviewer judge the files.

[Skills](skills.md) describes each, with its arguments and what it writes.

## The reviewer

The `reviewer` agent reads the files and the rules that govern them, and never edits. A broken `MUST` is a finding; a broken `SHOULD` is one unless the code shows its reason; a `MAY` never is. It skips what the tools already hold, and returns one finding per line, `<path>:<line> — <rule> — <what is wrong> — <the fix>`:

```text
src/orders/order.ts:42 — fact-has-one-source — the total is stored beside the lines it sums — compute it from the lines
```

## Hooks

| When | The hook |
|---|---|
| A session starts, is cleared or compacted, or a sub-agent starts | gives the digest of the active blocks |
| The agent reads or edits a file | names the blocks that govern it, their files and their `MUST` rules, once per block |
| The agent runs a command | records the tree when the project's check passes |
| You send a prompt | records the tree the turn starts from |
| The agent stops | blocks the stop once when the tree changed since the check last passed, and names the blocks of the changed files that no review has seen |

### Which blocks govern a file

A block's `governs` globs say which files it governs. A domain and a platform govern every file of the unit that lists them, as core does; a language governs the files written in it, and a tool's block the files it configures. A block also governs what every active block that needs it governs, through `requires`, `extends` and a seam.

### The digest

It stays under Claude Code's limit of 10,000 characters and holds:

1. the release and the folder of its blocks;
2. `constitution.yaml makes <n> blocks active.`;
3. the warnings about `constitution.yaml`, to tell you at the start of a session;
4. core's card and the list of core's chapters;
5. every active block by layer, with its summary and the chapters of the axes the project follows, then each unit's blocks;
6. the overrides.

A repository without `constitution.yaml` gets nothing. Without `.droneey/constitution/`, the digest only asks for `mise install`.

### What the hooks need

bash 3.2 and any POSIX awk, nothing else in the project, so a project in any language can follow the Constitution. The resolved set of blocks is kept outside the project, in `/tmp/droneey-constitution-<uid>/<session>/`, for the later hooks and the skills.
