---
id: task-runner
summary: A runner of tasks, which runs a unit's check, specs and fixes.
requires: []
languages: []
governs: []
---

# Task runner

> Runs the tasks a project declares, each tool's by the name its block gives, and the tasks that run every task of one action.

The runner's preset writes each tool's tasks, in its `with/` file of that tool's block, and a tool whose block requires one runner's block, as `bun-test` requires `js-runtime/bun`, gives that runner's tasks in its own preset file and runs no partner's tasks. A project lists the runner's block, which brings this one.
