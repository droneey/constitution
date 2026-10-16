# YAML with shell

> Governs the shell commands a YAML file holds.

## Code

### embedded-command-kept-short · SHOULD

A command a YAML file holds — a step of a CI workflow, a hook's command — is kept within the number of commands the project sets; anything longer is a `.sh` file the step runs.

| Why | Tags |
|---|---|
| a command embedded in another file is run by a shell with options its runner chose and reaches an analyser only through the file that holds it, so what grows there grows hard to read and to check. | [] |

### embedded-command-expansion-double-quoted → expansion-double-quoted · MUST

A command a YAML file holds double-quotes every expansion, as a script does.

| Why | Tags |
|---|---|
| an embedded command is parsed by the same shell, so an unquoted expansion splits and globs there too. | [] |

## Security

### runner-value-reaches-the-command-through-the-environment → outside-input-reaches-interpreters-as-parameters · MUST

A value a CI runner substitutes into a step's text — an issue's title, a branch's name — reaches the command a YAML file holds only as an environment variable the command reads, never pasted into the command's text.

| Why | Tags |
|---|---|
| the runner pastes the value into the text before the shell parses it, so a title that holds `$(…)` runs as a command with the pipeline's secrets. | [security] |
