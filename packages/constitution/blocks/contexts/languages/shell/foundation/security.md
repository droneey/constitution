# Security

> Governs a script's security: outside input, tracing, secrets and exported variables.

## Secrets

### xtrace-never-ships → secret-kept-out-of-output · MUST

A committed script never turns on `set -x`.

| Why |
|---|
| the trace prints every command with its expanded arguments, secrets included, into logs that others read. |

### secret-set-only-for-the-command-that-reads-it → child-process-environment-built-for-it · MUST

A script reads a secret it received into a variable it does not export and unsets the name it came by — `token="$TOKEN"; unset TOKEN` — and passes the secret only to the one command that reads it: `TOKEN="$token" command`, or on its standard input.

| Why |
|---|
| every command a script runs inherits what it exported, so a secret exported once reaches every tool, and every tool those start. |

### variable-exported-only-for-the-commands-that-read-it → child-process-environment-built-for-it · MUST

A script exports no variable its commands do not read.

| Why |
|---|
| every command a script runs inherits what it exported, and every command those start. |

## Input from outside

### outside-input-passed-as-an-argument → outside-input-reaches-interpreters-as-parameters · MUST

Input from outside reaches a command only as a quoted argument, after `--` where the command takes options, never through `eval`, `sh -c` or a command line built as a string.

| Why |
|---|
| text joined into a command line is parsed as shell, so whoever wrote it runs commands, and a value that starts with `-` is read as an option. |
