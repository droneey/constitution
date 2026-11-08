# Code

> Governs any shell code no other chapter governs: what a script does, its expansions and its lists, and the shell code other files hold.

## Vocabulary

A **shell command** is one invocation, in shell code, of a program, a builtin or a function, with its arguments.

## General

### script-only-glues-programs · SHOULD

Every script only runs programs and passes their results along. Logic of its own, such as parsing structured data, computing over records or branching on more cases than the project sets, is written in the project's main language, the one most of its own code is written in.

| Why |
|---|
| the shell has no types and no data structures beyond arrays, so logic written in it grows bugs that nothing catches. |

### shell-code-another-file-holds-kept-short · SHOULD

Every piece of shell code another file holds stays within the number of shell commands the project sets. Such code includes a manifest's script, an automation step's and a hook's, and what grows longer moves into a shell script that code runs.

| Why |
|---|
| shell code embedded in another file runs under the `set` flags its runner chose and reaches a shell linter only through that file, or not at all, so what grows there grows hard to read and to check. |

## Expansions and lists

### expansion-double-quoted · MUST

Every expansion of a parameter or a shell command's output is double-quoted, in a script and in shell code another file holds. It holds for an array's elements too. Exempt: the right side of an assignment no builtin such as `local` or `export` takes, the word after `case`, the left side inside `[[ ]]`, everything inside `(( ))`, the right side of `==`, `!=` or `=~` inside `[[ ]]` where it is meant as a pattern, and the unquoted wrapper of the empty-array form `list-held-in-an-array` gives.

| Why |
|---|
| an unquoted expansion is split on spaces and expanded as a glob, so a file name with a space or a star becomes several arguments or other files. |

### list-held-in-an-array · SHOULD

In Bash, every list of words is held in an array, never in a string split on spaces. Such a list holds files, arguments or flags and is expanded as `"${<array>[@]}"`; below Bash 4.4, an array that may be empty is expanded as `${<array>[@]+"${<array>[@]}"}`, which `set -u` accepts.

| Why |
|---|
| a string split on spaces breaks every item that holds one, while an array keeps each item whole. |
