# Shell

> Governs the shell commands a YAML file holds.

## General

### runner-value-reaches-the-command-through-the-environment → outside-input-reaches-interpreters-as-parameters · MUST

A value a CI runner substitutes into a step's text — an issue's title, a branch's name — reaches the command a YAML file holds only as an environment variable the command reads, never pasted into the command's text.

| Why |
|---|
| the runner pastes the value into the text before the shell parses it, so a title that holds `$(…)` runs as a command with the pipeline's secrets. |
