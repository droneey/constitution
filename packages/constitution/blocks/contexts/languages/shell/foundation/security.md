# Security

> Governs a script's security: outside input, tracing and secrets.

## Secrets

### xtrace-never-ships → secret-kept-out-of-output · MUST

A committed script never turns on `set -x`.

| Why |
|---|
| the trace prints every command with its expanded arguments, secrets included, into logs that others read. |

### secret-set-only-for-the-command-that-reads-it → child-process-environment-built-for-it · MUST

A script hands a secret only to the command that reads it. It reads a secret it received into a variable it does not export and unsets the name the secret came by, then passes the secret to the one command that reads it, as a variable set for that command alone or on its standard input.

| Why |
|---|
| every command a script runs inherits what it exported, so a secret exported once reaches every tool, and every tool those start — least privilege. |

## Input from outside

### outside-input-passed-as-an-argument → outside-input-reaches-interpreters-as-parameters · MUST

Input from outside reaches a command only as a quoted argument. It comes after `--` where the command takes options, and never through `eval`, `sh -c` or a command line built as a string.

| Why |
|---|
| text joined into a command line is parsed as shell, so whoever wrote it runs commands, and a value that starts with `-` is read as an option. |
