---
id: js-runtime/bun
summary: Bun as runtime, package manager and script runner.
requires: [task-runner]
languages: []
governs: ["**/bunfig.toml", "**/package.json"]
---

# Bun

> Bun runs the program, installs its dependencies and runs its scripts.

The `bun` command runs a script, and `bunx` a package's binary. `bunfig.toml` holds its settings, `bun.lock` the versions it installed, and `trustedDependencies` of `package.json` the dependencies whose install scripts may run.
