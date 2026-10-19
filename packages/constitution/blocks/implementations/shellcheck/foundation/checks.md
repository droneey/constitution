# Checks

> Governs ShellCheck's optional checks, what it reads and its suppressions.

## General

### optional-checks-enabled-by-name · MUST

`.shellcheckrc` enables each optional check by its name, never with `enable=all`.

| Why | Tags |
|---|---|
| `all` turns on checks no rule asks for, such as braces around every variable, and each check a new release adds, so an update fails the check with findings nobody chose. | [] |

### embedded-command-reaches-shellcheck → script-passes-a-shell-analyser · MUST

A shell command another file holds reaches ShellCheck through the linter of that file, with ShellCheck pinned beside it where that linter runs the one it finds, or through a spec that extracts it from the file; a command neither hands to ShellCheck is moved into a `.sh` file the other file runs.

| Why | Tags |
|---|---|
| ShellCheck reads only a script, so a command in a CI workflow, an image's build steps or a hook's configuration is analysed only where something extracts it, and a linter that finds no ShellCheck skips it without a word. | [errors] |

### shellcheck-directive-names-code-and-reason → suppression-silences-one-finding · MUST

A suppression is `# shellcheck disable=SC<code> # <reason>` on the line above the command it silences; never before a file's first command, where it covers the whole file, and never in `.shellcheckrc`, where it covers every script.

| Why | Tags |
|---|---|
| ShellCheck never reports a directive that silences nothing, so only its place bounds what it hides. | [] |
