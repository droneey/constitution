# YAML with shell

> Governs the shell commands a YAML file holds.

## Code

### embedded-command-kept-short · SHOULD
A command a YAML file holds — a step of a CI workflow, a hook's command — is kept within the number of commands the project sets, quoted as a script is; anything longer is a `.sh` file the step runs.

| Why | Tags |
|---|---|
| a command embedded in another file is read by no shell linter and run by a shell with options its runner chose, so what grows there grows unchecked. | [] |
