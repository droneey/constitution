---
id: shellcheck
summary: ShellCheck analyses shell scripts and the commands files hold.
requires: [shell, _task-runner]
extends: null
abstract: false
languages: [shell]
governs: [".shellcheckrc"]
---

# ShellCheck

> **ShellCheck**, the **`shellcheck`** command, analyses shell.

ShellCheck reads no other file from **`.shellcheckrc`**{#shellcheck-settings}, into which `constitution` writes the settings of every block. The checks it runs by default, which no file names, hold most of the rest, and its default severity, `style`, reports every finding.
