# The plugin

> The engine of the Constitution in Claude Code: three skills, a reviewer and the hooks. The rules themselves come from the project's release, and the hooks' work from the `constitution` executable the project installs with it.

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
3. the warnings about `constitution.yaml` and the `presets` findings about the tools' configurations, to tell you at the start of a session;
4. [core's passport](../../packages/constitution/blocks/core/core.md) whole, its front matter aside, whose list of core's chapters gives the order they are read in;
5. every active block by layer — a domain or a context with its summary, an implementation by its library's name — with its chapters and seams, foundation's first, then axis by axis, on the axes the project follows, and its pack in square brackets; then, for each member of the workspace, what its own `constitution.yaml` adds to the repository's and what it leaves out;
6. the overrides.

A repository without `constitution.yaml` gets nothing. When `.droneey/constitution/` is missing, or holds a release of a block format this executable cannot read, the digest is one line that names it and points to `constitution doctor`.

### What the hooks need

bash and the `constitution` executable on `PATH`, which mise installs from the release the project pins ([the quick start](../../README.md#-quick-start)); nothing else in the project, so a project in any language can follow the Constitution. Each hook of `hooks.json` runs `hooks/hook.sh <event>`, which hands Claude Code's event on standard input to `constitution hook <event>`: `session-start`, `post-tool-use`, `record-check`, `user-prompt-submit` or `stop`. Without the executable a hook prints one line that says to install it, and never fails the session.

The resolved set of blocks is kept outside the project, in `/tmp/droneey-constitution-<uid>/<session>/`, for the later hooks and the skills.

### The executable

`constitution` is the same executable outside a session:

- `constitution check` runs the checks below in turn: the blocks of the folder it runs in, when it holds a Constitution or a pack; the presets under its `presets/`, against those blocks; then the project around it. `--base <folder>` names the Constitution a pack extends.
- `constitution blocks check` checks the blocks of the folder it runs in alone, the pack's against `--base <folder>`.
- `constitution presets check` gives the warnings of the project's `constitution.yaml`, of each member's and the `presets` findings, the ones the digest gives; a member of the workspace that keeps no `constitution.yaml` is one of them.
- `constitution presets plan` prints the configuration files `apply` would write, each with the preset entries that write into it, what each unit's runners give `constitution run`, and what is wrong in the presets.
- `constitution presets apply` writes into each unit's configuration files what the presets of the release and of the packs it follows give its blocks, beside the settings the files keep of their own, and records what it wrote in the unit's `constitution.lock`, so the next run removes what the blocks no longer give. A value the user loosened is a finding, and apply writes nothing until it is put back or an override in `constitution.yaml` lowers its rule. A `constitution.lock` that does not parse, as a merge's conflict leaves it, is written again from the files, and apply says so; any other finding holds the plan, which then writes nothing. A default is written once, and stays deleted once the user deletes it. It ends by running the `fix` of each unit it wrote a file of, as `constitution run fix` would; `--no-fix` leaves the files as written.
- `constitution run <check|test|fix>` runs what the runner blocks of the unit around the folder give for that entry point — every unit's, the root's first, from the repository's root — each command printed before it runs, and stops at the first that fails.
- `constitution doctor` says how the installation stands, and changes nothing: the plugin, which differs from this executable only when its own files — its manifest, hooks, skills and agents — differ from those the executable was built with, compared by a hash of their content, its version then saying which is older; the latest release, which it skips without a network; the executable on `PATH`; the project's `.droneey/constitution` link and the release behind it; and lefthook's git hooks. Each part that is not sound comes with what to do.
- `constitution hook <event>` is what the hooks run.

Each command opens its help, `-h` or `--help`, with examples. On a terminal a check draws a spinner on standard error while each step runs, and its result in colour; in a pipe, in CI, under `NO_COLOR` or with `--plain` it prints the same as plain text, each step's line on standard error and the result on standard output; `--no-color` and `--no-motion` take away only the colour or the motion. A command exits 0 when all is sound, 1 on a finding, a warning or a part to look at, 2 on a command line typed wrong, 70 on a defect of its own, and 130 when interrupted.
