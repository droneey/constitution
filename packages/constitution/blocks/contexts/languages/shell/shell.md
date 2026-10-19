---
id: shell
summary: "Shell scripts: their shell, failures, quoting and temporary files."
requires: []
extends: null
abstract: false
languages: []
dictionary: [Bash, .sh]
governs: ["**/*.sh", "**/*.bash"]
---

# Shell

> Shell scripts, in Bash or in POSIX sh where Bash is absent, that glue commands together: hooks, CI steps, installers and small tools.

The shell splits and globs every word it expands unless it is quoted, and carries on after a failed command unless the script tells it otherwise.
