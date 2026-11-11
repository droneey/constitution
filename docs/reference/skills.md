# Skills

> The plugin's three skills: what each takes and what it writes.

Each skill is a `SKILL.md` of the plugin, called by its slash command. `/constitution:ratify` and `/constitution:override` run only when you call them; the agent never starts them on its own. `/constitution:review` is called by you or by the agent. A skill shows what it will write and writes it only after your yes. [The plugin](plugin.md) shows where the skills sit beside the reviewer and the hooks.

| Skill | Called by | Writes |
|---|---|---|
| [`/constitution:ratify`](#constitutionratify) | you only | `constitution.yaml`, `PROJECT.md`, `DECISIONS.md`, draft blocks of a pack, the tools' configurations |
| [`/constitution:override [rule]`](#constitutionoverride) | you only | `constitution.yaml` |
| [`/constitution:review [all\|edits]`](#constitutionreview) | you or the agent | nothing; the agent fixes the findings |

## /constitution:ratify

Puts a repository under the Constitution. It takes no arguments.

1. Installs the release first when the project has none, as [the quick start](../../README.md#-quick-start) does: the tool in `mise.toml`, the link to `.droneey/constitution`, `/.droneey` in `.gitignore`. Then you call it again.
2. Shows the blocks the installed release offers, by rank.
3. Asks which [axes](../how-it-works.md#three-axes) the repository follows: `architecture`, `workflow`, both or neither.
4. Reads the manifests, lock files, tool configurations, folders and CI, and proposes each block with the evidence that picked it, then the blocks those require.
5. Offers a block of the project's own pack for a library the release has no block for.
6. Proposes the runner of each unit, and each check the repository runs that no block writes as a `check:` script of its own.
7. Asks which blocks each [member of a workspace](constitution-yaml.md#members-of-a-workspace) follows, for a `constitution.yaml` of its own.
8. Interviews you for `PROJECT.md`, a question or two at a time.
9. Runs `constitution presets apply`, which writes each tool's configuration from [the presets](presets.md) of the unit's blocks, and shows the diff and the findings, grouped by rule; each finding is fixed in the code or offered as an override through `/constitution:override`.

[Choose the blocks](../guides/choose-blocks.md) shows how to check its proposal and change the list later.

## /constitution:override

Adds, changes or removes one override: a Constitution rule lowered for the whole repository or for one unit. It takes the rule's slug, or asks for it.

- Shows the rule's block, level and statement. The rules that tighten it keep their own levels.
- Then asks, one answer at a time:
  - the new level, lower than the rule's own: `SHOULD` or `MAY` for a `MUST`, `MAY` for a `SHOULD`;
  - your reason, one line in your words; there is no override without one;
  - until when it holds, if ever;
  - its scope: the repository, or one member of its workspace, whose own `constitution.yaml` takes the override.
- Shows the exact lines of [the entry](constitution-yaml.md#overrides) and writes them once you agree.

[Override a rule](../guides/override-a-rule.md) explains what an override does.

## /constitution:review

Runs the project's check, then has one fresh reviewer judge the change against the rules that govern its files, routes its findings, and ends with a report to you. It is what the stop hook asks for when the agent hands back a change no review covers.

| Argument | Reviews |
|---|---|
| `edits`, the default | the files that differ from `HEAD`, new files included |
| `all` | every file of the repository, in batches of at most one hundred files |

A failing check is fixed before the review starts. The reviewer is given the diff, the overrides and the rules `constitution rules --for <files> --why` prints for the changed files, and nothing of the conversation. Where the change touches a `blocks/` or `presets/` folder, [the rule reviewer](plugin.md#the-rule-reviewer) judges it beside the reviewer, given the diff and the overrides, and its findings are routed the same way. [The reviewer](plugin.md#the-reviewer) returns one finding per line, with its level and confidence. A clear breach whose fix fits the task is fixed; an uncertain one is answered `fixed` or `disagree, because …` and a disputed one settled by a second review; a `SHOULD` kept is kept with its reason; and you are asked only where the rules are silent, clash, or need a decision outside the task. A finding against a rule the repository does not want is a case for `/constitution:override`. The report names what was done and run, what was not verified, the questions the agent would have asked, the decisions the rules could not make, and the `SHOULD` findings left aside.
