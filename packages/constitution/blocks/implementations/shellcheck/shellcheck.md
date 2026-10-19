---
id: shellcheck
summary: ShellCheck analyses shell scripts and the commands files hold.
requires: [shell]
extends: null
abstract: false
languages: [shell]
dictionary: [ShellCheck, shellcheck, .shellcheckrc]
governs: [".shellcheckrc"]
---

# ShellCheck

> Analyses shell.

ShellCheck extends no file, so `.shellcheckrc` at the project's root is a copy of `presets/shell/shellcheck/foundation/self.shellcheckrc` of the Constitution's release archive, which enables by name the optional checks the rules of `shell` need, and `presets/shell/shellcheck/foundation/bindings.yaml` says which check holds which rule. The checks it runs by default, which no file names, hold most of the rest, and its default severity, `style`, reports every finding.
