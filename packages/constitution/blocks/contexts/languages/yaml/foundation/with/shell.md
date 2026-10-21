# Shell

> Governs the shell commands a YAML file holds.

## General

### embedded-command-kept-short → command-another-file-holds-kept-short · SHOULD

Each command a YAML file holds — a CI workflow's step, a hook's command — keeps within the project's limit of commands, and a longer one becomes a `.sh` file the step runs.

| Why | Tags |
|---|---|
| a command in a YAML file reaches a shell linter only through a tool that reads the file's format, so a long one is checked less than the same lines in a `.sh` file. | [] |

### embedded-command-expansion-double-quoted → expansion-double-quoted · MUST

A command a YAML file holds double-quotes every expansion, as a script does.

| Why | Tags |
|---|---|
| an embedded command is parsed by the same shell, so an unquoted expansion splits and globs there too. | [] |

### runner-value-reaches-the-command-through-the-environment → outside-input-reaches-interpreters-as-parameters · MUST

A value a CI runner substitutes into a step's text — an issue's title, a branch's name — reaches the command a YAML file holds only as an environment variable the command reads, never pasted into the command's text.

| Why | Tags |
|---|---|
| the runner pastes the value into the text before the shell parses it, so a title that holds `$(…)` runs as a command with the pipeline's secrets. | [security] |
