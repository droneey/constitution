---
id: actionlint
summary: Lints GitHub Actions workflows, their steps' commands included.
requires: [yaml, _task-runner]
extends: null
abstract: false
languages: [yaml]
governs: [".github/actionlint.yaml"]
---

# actionlint

> **`actionlint`** lints the GitHub Actions workflows of a repository, and the command of each `run:` step through the shell analyser it finds on the `PATH`.

actionlint is pinned like any other tool and reads every workflow of the repository it runs in, so the topmost unit that lists it runs it; any finding fails it. It reads its settings from **`.github/actionlint.yaml`**{#actionlint-settings}, where a project names its self-hosted runners and its configuration variables; the presets write none, as its default checks hold every active rule of a workflow that a linter can see.

Its script turns off the pyflakes analyser actionlint would run when it finds one, which no block pins, and relies on the shell analyser the project pins, so the check finds the same on every machine.
