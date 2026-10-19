# Shell

> Governs the shell commands a package's scripts hold.

## General

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
