---
id: shellcheck
summary: ShellCheck analyses shell scripts and the commands files hold.
requires: [shell, task-runner]
languages: [shell]
governs: [".shellcheckrc"]
---

# ShellCheck

> ShellCheck, the `shellcheck` command, analyses shell code.

ShellCheck reads the first `.shellcheckrc` or `shellcheckrc` it finds in the script's folder or a folder above it, then in the user's home and configuration folders, and only that one, so a nested file shadows the root's. `constitution` writes the settings of every block into the root's `.shellcheckrc`. Its default severity, `style`, reports every finding.
