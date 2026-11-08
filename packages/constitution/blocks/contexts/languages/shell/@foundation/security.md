# Security

> Governs a script's security: its secrets, its tracing, input from outside and the making of its temporary files.

## Secrets

### xtrace-never-ships → secret-kept-out-of-output · MUST

No committed script turns on `set -x`.

| Why |
|---|
| the trace prints every shell command with its expanded arguments, secrets included, into logs that others read. |

### secret-never-exported → child-process-variables-built-for-it · MUST

Every secret a script receives stays out of the variables it exports, the one it came by included. It reaches the program that reads it as a variable set for that program alone or on its standard input.

| Why |
|---|
| every program a script runs inherits what it exported, so a secret exported once reaches every tool, and every tool those start — least privilege. |

## Outside input

### outside-input-quoted-or-piped → outside-input-reaches-interpreters-as-parameters · MUST

Every input from outside reaches a program as a quoted argument, a variable set for it or its standard input. It is never joined into text a shell parses, such as the argument of `eval`, the script `sh -c` runs or a command line built as a string. No variable the program reads as code or as a path to code, such as `BASH_ENV`, `LD_PRELOAD` or `PATH`, takes outside input other than a value of the script's own environment.

| Why |
|---|
| text joined into a command line is parsed as shell, and a value in a variable a program reads as code or as a path to code is run by it, so whoever wrote either runs commands of their own. |

## Temporary files

### temporary-file-named-by-mktemp → temporary-file-named-unpredictably · MUST

Every temporary file or folder a script makes is made by `mktemp`.

| Why |
|---|
| a name a script builds itself, from its process id, the time or a fixed word, is guessed and taken by another user or run before the script opens it, while `mktemp` picks a name none of them can predict and makes the file in the same step, open only to the user who runs the script. |
