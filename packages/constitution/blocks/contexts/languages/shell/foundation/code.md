# Code

> Governs what a script does, its expansions, its lists and its reads, and the commands other files hold.

## General

### script-only-glues-commands · SHOULD

A script runs commands and passes their results along; logic of its own — parsing structured data, computing over records, branching on many cases — is written in the program's language.

| Why |
|---|
| the shell has no types and no data structures beyond arrays, so logic written in it grows bugs that nothing catches. |

### command-another-file-holds-kept-short · SHOULD

A shell command another file holds — a manifest's script, a CI step, a hook's command — stays within the number of commands the project sets, and anything longer is a `.sh` file the command runs.

| Why |
|---|
| a command embedded in another file runs under options its runner chose and reaches a shell linter only through that file, or not at all, so what grows there grows hard to read and to check. |

### expansion-double-quoted · MUST

Every expansion of a parameter or a command is double-quoted — `"$file"`, `"$(date +%s)"`, `"${paths[@]}"` — save the left side inside `[[ ]]`, and inside `(( ))`; the right side of `==`, `!=` or `=~` in `[[ ]]` is quoted unless it is meant as a pattern.

| Why |
|---|
| an unquoted expansion is split on spaces and expanded as a glob, so a file name with a space or a star becomes several arguments or other files. |

### list-held-in-an-array · SHOULD

In Bash, a list of words — files, arguments, flags — is held in an array and expanded as `"${list[@]}"`, never in a string split on spaces; below Bash 4.4, an array that may be empty is expanded as `${list[@]+"${list[@]}"}`, which `set -u` accepts.

| Why |
|---|
| a string split on spaces breaks every item that holds one, while an array keeps each item whole. |

### line-read-raw · SHOULD

A line is read by `IFS= read -r`.

| Why |
|---|
| without `-r`, read drops backslashes, and without an empty `IFS` it trims the line's leading and trailing spaces. |
