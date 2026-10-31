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
| A session starts, is resumed, cleared or compacted, or a sub-agent starts | gives the digest; a clear or a compaction also forgets the rules the session's agent has read; and the session's start, never a sub-agent's, removes from the project the folders of other sessions [untouched for a day](#what-the-hooks-keep) |
| Before the agent edits a file, runs a command, starts a sub-agent or calls an MCP tool | [the rule gate](#the-rule-gate) refuses the action until the agent has read the rules that govern it |
| The agent reads or edits a file | names the blocks that govern it, their files and their `MUST` rules, once per block |
| The agent reads a file | records the rules it read whole, or the [debt](#debts) of the rules that govern the file |
| The agent edits a file, runs a command or calls an MCP tool, the command or call failing included | records the files it changed, and at its first change of a file gives [the hot list](#the-hot-list) |
| The agent runs a command | records the tree when the project's check passes |
| You send a prompt | records the tree the turn starts from |
| The agent or a sub-agent stops | holds the stop while it owes rules, then [the hand-back](#the-hand-back) until its own changes are checked and, for the session's agent, reviewed |
| The session ends | removes its folders from the projects, and leaves the rest of [what the hooks keep](#what-the-hooks-keep) for a resume |

Every text a hook gives stays within 10,000 characters, Claude Code's limit for the context and the messages a hook adds, past which it replaces the text with a file and a preview of its start; a reason shown to the agent is held to the same limit. Each list a hook prints is cut to a share of that limit, and a counted note says how many it left out.

### Which blocks govern a file

A block's `governs` globs say which files it governs. A domain and a platform govern every file of the unit that lists them, as core does; a language governs the files written in it, and a tool's block the files it configures. A block also governs what every active block that needs it governs, through `requires`, `extends` and a seam.

### The digest

It holds:

1. the release and the folder of its blocks, and the line that says `constitution.yaml` does not parse, when it does not;
2. [core's passport](../../packages/constitution/blocks/core/core.md), its front matter aside;
3. three lines on what the rule gate asks of the agent;
4. the map of the active blocks: their names, one line to a layer, a pack's with its pack in square brackets; then a line for each member of the workspace whose own `constitution.yaml` adds blocks or leaves some out;
5. the warnings about `constitution.yaml` and the `presets` findings about the tools' configurations, to tell you at the start of a session.

All after the first part is held to 9,400 bytes, so the digest stays within Claude Code's limit. Core's passport and the three lines are given whole, and the blocks check holds core's passport within 3,500 bytes; the warnings are given within a share of 1,000 bytes, with a count of the rest. The map takes the room left and, when it does not fit, is cut from its end, the members' lines first, with a note of how many lines were cut and that `constitution.yaml` names every block.

The rules themselves the gate gives as they are needed. A repository without `constitution.yaml` gets nothing. When `constitution.yaml` does not parse, the digest is core's passport and the three lines, with no map. When `.droneey/constitution/` is missing, or holds a release of a block format this executable cannot read, the digest is one line that names it and points to `constitution doctor`.

### The rule gate

Before an action, the gate works out the rules that govern it, read afresh from `constitution.yaml`, the packs and the release: core's, those of the blocks that govern every file, and, for an edit, those of the blocks that govern the file. A rule is known by its slug and a hash of its text, its Why and the level it binds at there, an override and its reason included, so a rule asked for again is one that is new or changed. The rules the agent has not read are written into the project, to files under `.droneey/constitution-sessions/<session>/parts/` of at most about 60 KB, and the action is refused until each is read whole with Read; a read with an offset or a limit records nothing. Each agent — the session's own, each sub-agent — keeps its own record of what it read, and a sub-agent starts with none.

The refusal names the files to read within 4,000 bytes and the files a command changed within 2,000; a note counts the rest, which the next refusal names once these are read. Three refusals in a row of the same thing — the same rules unread, or the same reason [the rules cannot be read](#when-the-rules-cannot-be-read) — let the action through and tell you so, and the next stop tells you how many went through.

A path is followed through its links, so a file reached through a link is governed as the file it is. What the gate writes is never a change to the tree, and git should ignore `.droneey/`; the gate says so when git tells it does not, and says nothing when git cannot tell.

### Debts

Reading a file of the project leaves a debt: the rules that govern it are owed before the agent's next action and before its turn ends, and once they are read the debt is settled. A command or an MCP call is bracketed by the tree before and after it, and each file it changed becomes a debt too, whatever the command was and whether or not it failed; the command itself is never read. A debt on a file of a project whose rules cannot be read holds only the turn, never an action on another project's files.

### The hot list

At an agent's first change of a file, the hook names the rules of a short list of those most often broken that govern the file, each by its slug and the first sentence of its statement. The files that share one set of these rules are named once, before it, within 1,000 bytes and a count of the rest; the sets are given within 4,500 bytes, and a note counts the files whose sets did not fit.

The notes that name the blocks governing a file the agent reads or edits share the answer with the hot list and are given within 3,000 bytes; a block left out is named at the file's next read or edit.

### The hand-back

A stop is held for what the agent itself changed:

- the session's agent, until the project's check passed on the tree and, where blocks govern the files it changed, a `constitution:reviewer` review was recorded for the tree;
- a sub-agent, until the check passed on the tree; the files it changed become a review the session's agent owes, as a sub-agent cannot start the reviewer.

The reason a stop is held names what is missing: the blocks within 1,500 bytes, and each sub-agent whose work is owed with its files within 1,000, the sub-agents within 3,000, each list with a count of the rest. Three holds in a row for the same tree and the same steps missing let the stop through and tell you so. No review is asked for files no block governs. A sub-agent's stop is known by the `agent_id` Claude Code gives it; a stop whose agent does not match its event — a sub-agent's that names no agent, or the session's that names one — goes through, held for neither the rules owed nor the hand-back.

A stop made while the hook is active — Claude Code's `stop_hook_active`, set when the agent goes on because a stop hook held it — goes through, past both the rules owed and the hand-back, so an agent that stops to ask you a question is not held twice; the next turn's stop asks again.

### When the rules cannot be read

A project with no `constitution.yaml` is never gated. One that declares a Constitution whose rules cannot be read is: an action is refused when no release is installed — a worktree with none of its own reads the main checkout's — when `constitution.yaml` does not parse, save an edit of it, when a rule file cannot be read, and when the rules to read cannot be written. The refusal names each reason within 4,000 bytes, and when three refusals let the action through, the pass names them too.

### What the hooks need

bash and the `constitution` executable on `PATH`, which mise installs from the release the project pins ([the quick start](../../README.md#-quick-start)); nothing else in the project, so a project in any language can follow the Constitution. Each hook of `hooks.json` runs `hooks/hook.sh <event>`, which hands Claude Code's event on standard input to `constitution hook <event>`: `session-start`, `pre-tool-use`, `post-tool-use`, `record-check`, `user-prompt-submit`, `stop` or `session-end`. Without the executable a hook prints one line that says to install it, and never fails the session.

### What the hooks keep

The resolved set of blocks, the marks of the tree, the files each agent changed, the reviews owed, and what each agent read and owes are kept outside the project, under `$XDG_STATE_HOME/droneey-constitution/sessions/<session>/`, `~/.local/state` when it is unset; only the rules an agent is asked to read are written into the project, as it reads them as project files. The tree kept before a command or an MCP call is removed once the call is settled.

When the session ends, its folders in every project the gate wrote rules into are removed. What it keeps outside the project stays, since Claude Code can resume any session that ended: a resumed session still holds its hand-back for the changes it made before, and the gate writes again the rules it asks for. That folder goes 30 days after it was last saved, the one bound a session that ends by a crash relies on, as it sends no end; and a session's start removes from the project the folders of other sessions untouched for more than a day.

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
