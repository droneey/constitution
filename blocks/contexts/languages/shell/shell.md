---
id: shell
summary: "Shell scripts: their shell, failures, quoting and temporary files."
requires: []
extends: null
abstract: false
languages: []
dictionary: [Bash, .sh]
governs: ["**/*.sh"]
---

# Shell

> Shell scripts, in Bash or in POSIX sh where Bash is absent, that glue commands together: hooks, CI steps, installers and small tools. The shell splits and globs every word it expands unless it is quoted, and carries on after a failed command unless the script tells it otherwise.

## Code

### script-only-glues-commands · SHOULD
A script runs commands and passes their results along; logic of its own — parsing structured data, computing over records, branching on many cases — is written in the program's language.

| Why | Tags |
|---|---|
| the shell has no types and no data structures beyond arrays, so logic written in it grows bugs that nothing catches. | [] |

### expansion-double-quoted · MUST
Every expansion of a parameter or a command is double-quoted — `"$file"`, `"$(date +%s)"`, `"${paths[@]}"` — save the left side inside `[[ ]]`, and inside `(( ))`; the right side of `==`, `!=` or `=~` in `[[ ]]` is quoted unless it is meant as a pattern.

| Why | Tags |
|---|---|
| an unquoted expansion is split on spaces and expanded as a glob, so a file name with a space or a star becomes several arguments or other files. | [] |

### list-held-in-an-array · SHOULD
In Bash, a list of words — files, arguments, flags — is held in an array and expanded as `"${list[@]}"`, never in a string split on spaces.

| Why | Tags |
|---|---|
| a string split on spaces breaks every item that holds one, while an array keeps each item whole. | [] |

### line-read-raw · SHOULD
A line is read by `IFS= read -r`.

| Why | Tags |
|---|---|
| without `-r`, read drops backslashes, and without an empty `IFS` it trims the line's leading and trailing spaces. | [] |

## Names

### shell-name-case-by-kind → name-case-by-kind · SHOULD
A function and a variable are lower_snake_case; a constant and an environment variable are UPPER_SNAKE_CASE.

| Why | Tags |
|---|---|
| the case alone then tells a value the script owns from one it shares with every process it starts. | [] |

## Functions

### script-logic-in-a-main-function · SHOULD
A script that defines functions runs its logic in a function `main`, called on its last line as `main "$@"`.

| Why | Tags |
|---|---|
| the shell then reads the whole file before it runs a line, so a script cut short in transfer or edited while it runs never executes half of itself. | [] |

## Relations

### function-variable-declared-local → state-never-global-and-mutable · MUST
In Bash, a function declares every variable it sets as `local`, and one assigned from a command substitution on a line of its own before it: `local out` then `out="$(command)"`.

| Why | Tags |
|---|---|
| a variable a function sets without `local` changes the caller's variable of the same name, an effect no call shows, and `local out="$(command)"` returns the status of `local`, so `set -e` never sees the command fail. | [] |

## Errors

### script-stops-on-a-failed-command → failure-is-expected-or-defect · MUST
A Bash script runs under `set -euo pipefail` and `shopt -s inherit_errexit`, and a POSIX sh script under `set -eu`, with `-o pipefail` where its shells have it, set before its first command.

| Why | Tags |
|---|---|
| by default the shell carries on after a failed command, a failed stage of a pipe or an unset variable, so the next command runs on a result that never came, as `rm -rf "$dir/"` does with an empty `dir`. | [errors] |

## Effects

### temporary-file-removed-by-an-exit-trap → resource-released-on-every-path · MUST
A temporary file or folder is made by `mktemp` and removed by a `trap` on `EXIT` — in POSIX sh also on `HUP`, `INT` and `TERM`, by a handler that exits — set right after it is made.

| Why | Tags |
|---|---|
| a fixed name collides with other runs and can be planted by another user, and only the trap removes the file when the script fails or is interrupted. | [security] |

### script-diagnostics-on-standard-error → diagnostics-written-through-a-logger · MUST
A script writes its diagnostics and errors through one function of its own that prints to standard error — `log() { printf '%s\n' "$*" >&2; }` — and only its output to standard output.

| Why | Tags |
|---|---|
| a caller pipes standard output into the next command, where a diagnostic mixed into it becomes data. | [] |

## Security

### outside-input-passed-as-an-argument → outside-input-reaches-interpreters-as-parameters · MUST
Input from outside reaches a command only as a quoted argument, after `--` where the command takes options, never through `eval`, `sh -c` or a command line built as a string.

| Why | Tags |
|---|---|
| text joined into a command line is parsed as shell, so whoever wrote it runs commands, and a value that starts with `-` is read as an option. | [security] |

### xtrace-never-ships → secret-and-personal-data-kept-out-of-output · MUST
A committed script never turns on `set -x`.

| Why | Tags |
|---|---|
| the trace prints every command with its expanded arguments, secrets included, into logs that others read. | [security] |

### secret-set-only-for-the-command-that-reads-it → child-process-environment-built-for-it · MUST
A script reads a secret it received into a variable it does not export and unsets the name it came by — `token="$TOKEN"; unset TOKEN` — and passes the secret only to the one command that reads it: `TOKEN="$token" command`, or on its standard input.

| Why | Tags |
|---|---|
| every command a script runs inherits what it exported, so a secret exported once reaches every tool, and every tool those start. | [security] |

### variable-exported-only-for-the-commands-that-read-it → child-process-environment-built-for-it · MUST
A script exports no variable its commands do not read; the rest of the environment it received is its caller's choice for them.

| Why | Tags |
|---|---|
| every command a script runs inherits what it exported, and every command those start. | [security] |

## Layout

### executable-script-names-its-shell · MUST
An executable script names the shell it is written for on its first line: `#!/usr/bin/env bash`, or `#!/bin/sh` for one written to POSIX alone.

| Why | Tags |
|---|---|
| a script run by another shell than its own fails on the first construct that shell lacks, often silently, and `env` finds the Bash the project pins rather than an older one of the system. | [] |

### shell-file-ends-in-sh → format-has-one-extension · SHOULD
A shell file ends in `.sh`; a command installed on a user's path under its own name is built or linked from such a file.

| Why | Tags |
|---|---|
| one extension lets every glob, linter and reader find every script, while a command's name is what its users type. | [] |
