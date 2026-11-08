# Workflows

> Governs the commands a workflow's steps run.

## General

### runner-value-reaches-the-command-through-the-environment → outside-input-reaches-interpreters-as-parameters · MUST

Every value a workflow's expression substitutes reaches a step's command only as an environment variable. Such values include an issue's title and a branch's name. None is written as an expression into the text of a `run:` step; the step sets it in its `env:`, and its command reads it from the environment.

| Why |
|---|
| the runner pastes the value into the text before the shell parses it, so a title that holds `$(…)` runs as a command with the pipeline's secrets. |
