# Errors

> Governs a failure in a script: how the script stops on a failed shell command or an unset variable, and how a function it calls as a condition catches its own.

## Catching and carrying

### script-stops-on-a-failed-shell-command → failure-never-dropped-unread · MUST

Every script stops on a failed shell command. A Bash script runs under `set -e -o pipefail`, with `shopt -s inherit_errexit` where its Bash is 4.4 or later, and a POSIX sh script under `set -e`, with `-o pipefail` where its shells have it, each set before its first shell command. Exempt: a sourced file.

| Why |
|---|
| by default the shell carries on after a failed shell command or a failed program in a pipe, so the next one runs on a result that never came — fail fast. |

### unset-variable-fails-the-script → defect-never-replaced-by-a-fallback · MUST

Every script fails on the expansion of an unset variable, never expanding it to nothing. It runs under `set -u`, set before its first shell command. Exempt: a sourced file, and an expansion that gives its own default, such as `${name:-}`.

| Why |
|---|
| by default the shell expands a variable never set, a misspelt one among them, to nothing and carries on, as a removal of a path built from an empty variable removes from the root — fail fast. |

### condition-function-checks-its-own-failures → failure-never-dropped-unread · MUST

Every function a script calls as a condition checks the result of each shell command it runs. A function is called as a condition where its result is tested, such as by `if`, `elif`, `while`, `until`, `!` or an and-or list.

| Why |
|---|
| errexit does not fire inside a function called as a condition, so a shell command that fails inside it is passed over, and the function answers with the result of its last one. |
