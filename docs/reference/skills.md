# Skills

> The plugin's three skills: what each takes and what it writes.

Each skill is a `SKILL.md` of the plugin, called by its slash command. `/constitution:ratify` and `/constitution:amend` run only when you call them; the agent never starts them on its own. `/constitution:check` is called by you or by the agent. A skill shows what it will write and writes it only after your yes. [The plugin](plugin.md) shows where the skills sit beside the reviewer and the hooks.

| Skill | Called by | Writes |
|---|---|---|
| [`/constitution:ratify`](#constitutionratify) | you only | `constitution.yaml`, `PROJECT.md`, `DECISIONS.md`, draft blocks of a pack, the tools' configurations |
| [`/constitution:amend [rule]`](#constitutionamend) | you only | `constitution.yaml` |
| [`/constitution:check [all\|edits]`](#constitutioncheck) | you or the agent | nothing; the agent fixes the findings |

## /constitution:ratify

Puts a repository under the Constitution. It takes no arguments.

1. Installs the release first when the project has none, as [the quick start](../../README.md#-quick-start) does: the tool in `mise.toml`, the link to `.droneey/constitution`, `/.droneey` in `.gitignore`. Then you call it again.
2. Shows the blocks the installed release offers, by layer.
3. Asks which [axes](../how-it-works.md#three-axes) the repository follows: `architecture`, `workflow`, both or neither.
4. Reads the manifests, lock files, tool configurations, folders and CI, and proposes each block with the evidence that picked it, then the blocks those require.
5. Offers a block of the project's own pack for a library the release has no block for.
6. Finds the command that runs every check, or asks for it.
7. Asks which blocks each [member of a workspace](constitution-yaml.md#members-of-a-workspace) follows, for a `constitution.yaml` of its own.
8. Interviews you for `PROJECT.md`, a question or two at a time.
9. Runs `constitution presets apply`, which writes each tool's configuration from [the presets](presets.md) of the unit's blocks, and shows the diff and the findings, grouped by rule; each finding is fixed in the code or offered as an override through `/constitution:amend`.

[Choose the blocks](../guides/choose-blocks.md) shows how to check its proposal and change the list later.

## /constitution:amend

Adds, changes or removes one override: a Constitution rule lowered for the whole repository or for one unit. It takes the rule's slug, or asks for it.

- Shows the rule's block, level and statement, and the rules that carry it out, which the override lowers too.
- Then asks, one answer at a time:
  - the new level, lower than the rule's own, `SHOULD` or `MAY`; a `MAY` rule cannot be lowered;
  - your reason, one line in your words; there is no override without one;
  - until when it holds, if ever;
  - its scope: the repository, or one member of its workspace, whose own `constitution.yaml` takes the override.
- Shows the exact lines of [the entry](constitution-yaml.md#overrides) and writes them once you agree.

[Override a rule](../guides/override-a-rule.md) explains what an override does.

## /constitution:check

Runs the project's check, then has the reviewer judge the files against the rules that govern them.

| Argument | Reviews |
|---|---|
| `edits`, the default | the files that differ from `HEAD`, new files included |
| `all` | every file of the repository, a block at a time |

A failing check is fixed before the review starts. [The reviewer](plugin.md#the-reviewer) returns one finding per line; a finding against a rule the repository does not want is a case for `/constitution:amend`.
