# The plugin

> The engine of the Constitution in Claude Code: three skills, a reviewer and the hooks. The rules themselves come from the project's release, and the hooks' work from the `constitution` program the project installs with it.

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
3. the warnings about `constitution.yaml` and about the tools' configurations that do not take the parts of their blocks, to tell you at the start of a session;
4. [core's passport](../../packages/constitution/blocks/core/core.md) whole, its front matter aside, whose list of core's chapters gives the order they are read in;
5. every active block by layer — a domain or a context with its summary, an implementation by its library's name — with its chapters and seams, foundation's first, then axis by axis, on the axes the project follows, and its pack in square brackets; then each unit's blocks;
6. the overrides.

A repository without `constitution.yaml` gets nothing. Without `.droneey/constitution/`, the digest only asks for `mise install`.

### What the hooks need

bash and the `constitution` program on `PATH`, which mise installs from the release the project pins ([the quick start](../../README.md#-quick-start)); nothing else in the project, so a project in any language can follow the Constitution. Each hook of `hooks.json` runs `hooks/hook.sh <event>`, which hands Claude Code's event on standard input to `constitution hook <event>`: `session-start`, `post-tool-use`, `record-check`, `user-prompt-submit` or `stop`. Without the program a hook prints one line that says to install it, and never fails the session.

The resolved set of blocks is kept outside the project, in `/tmp/droneey-constitution-<uid>/<session>/`, for the later hooks and the skills.

### The program

`constitution` is the same program outside a session:

- `constitution check` checks the blocks of the folder it runs in when it holds a Constitution or a pack (`--base <folder>` names the Constitution a pack extends), then the project around it: the warnings of `constitution.yaml` and of the wiring that the digest gives. It exits 1 on a finding or a warning.
- `constitution wiring` prints the configuration files the project's tools read, each with the units it serves, its template and the parts it takes, which `/constitution:ratify` writes.
- `constitution hook <event>` is what the hooks run.
