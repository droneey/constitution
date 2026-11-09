---
id: actionlint
summary: Lints GitHub Actions workflows, their steps' commands included.
requires: [task-runner]
languages: [yaml]
governs: [".github/actionlint.yaml", ".github/workflows/**"]
---

# actionlint

> actionlint, the `actionlint` command, lints the workflows under `.github/workflows/`, and the command of each `run:` step through the shell analyser it finds on the `PATH`.

actionlint reads every workflow of the repository it runs in, so the topmost unit that lists it runs it. It reads its settings from `.github/actionlint.yaml`, where a project names its self-hosted runners and its configuration variables; the presets write none. Its task turns off, with `-pyflakes=`, the pyflakes analyser actionlint would run when it finds one, which no block pins, and runs the shell analyser the project pins, so the check finds the same on every machine.
