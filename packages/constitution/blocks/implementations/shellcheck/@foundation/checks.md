# Checks

> Governs what ShellCheck reads, and its suppressions and their reasons.

## General

### embedded-command-reaches-shellcheck → rule-held-by-a-tool-where-one-can · MUST

Every piece of shell code another file holds reaches ShellCheck. It reaches it through the linter of that file, with ShellCheck pinned beside it where that linter runs the one it finds, or through a spec that extracts it from the file; shell code that reaches it in neither way moves into a shell script the other file runs.

| Why |
|---|
| ShellCheck reads only a script, so shell code in an automation step, an image's build steps or a hook's configuration is analysed only where something extracts it, and a linter that finds no ShellCheck skips it without a word. |

### shellcheck-directive-on-the-line-above → suppression-silences-one-finding · MUST

Every ShellCheck suppression is a `# shellcheck disable=SC<code>` directive on the line above the shell command it silences. It is never written before a file's first shell command, where it covers the whole file, nor in `.shellcheckrc`, where it covers every script. A finding on the first command that does work is silenced by a `:` line placed before the directive.

| Why |
|---|
| ShellCheck never reports a directive that silences nothing, so only its place bounds what it hides, and one placed wider than its shell command hides every later finding there. |

### shellcheck-reason-in-a-comment-of-its-own → suppression-states-its-reason · MUST

Every ShellCheck directive's reason stands in a comment of its own, after a second `#` or on the line above the directive. It is never written after the code inside the directive.

| Why |
|---|
| ShellCheck reads the words after the code as more of the directive and refuses it as a parse error, so a reason written there is dropped to make the directive work. |
