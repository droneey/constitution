# TypeScript with shell

> Governs the shell commands a package's scripts hold.

## Code

### package-script-kept-short · SHOULD
A script of `package.json` is kept within the number of commands the project sets; anything longer is a `.sh` file the script runs.

| Why | Tags |
|---|---|
| a command held in a manifest is read by no shell linter, so what grows there grows unchecked. | [] |

### package-script-expansion-double-quoted → expansion-double-quoted · MUST
A script of `package.json` double-quotes every expansion, as a shell script does.

| Why | Tags |
|---|---|
| a package script is parsed by a shell, so an unquoted expansion splits and globs there too. | [] |

## Security

### package-script-never-traces → xtrace-never-ships · MUST
A script of `package.json` never turns on `set -x` or runs a shell with `-x`.

| Why | Tags |
|---|---|
| the trace prints every command with its expanded arguments, secrets included, into logs that others read. | [security] |
