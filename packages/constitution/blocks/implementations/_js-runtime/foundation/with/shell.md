# Shell

> Governs the shell commands the scripts of `package.json` hold.

## General

### package-script-kept-short → command-another-file-holds-kept-short · SHOULD

Each script of `package.json` keeps within the project's limit of commands, and a longer one becomes a `.sh` file the script runs.

| Why |
|---|
| a command held in a manifest is read by no shell linter, so what grows there grows unchecked. |

### package-script-expansion-double-quoted → expansion-double-quoted · MUST

A script of `package.json` double-quotes every expansion, as a shell script does.

| Why |
|---|
| a package script is parsed by a shell, so an unquoted expansion splits and globs there too. |
