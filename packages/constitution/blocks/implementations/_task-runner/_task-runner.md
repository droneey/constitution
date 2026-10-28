---
id: _task-runner
summary: A runner of tasks, which runs a unit's check, specs and fixes.
requires: []
extends: null
abstract: true
languages: []
governs: []
---

# Task runner

> Runs the tasks a project declares, each tool's by the name its block gives, and the tasks that run every task of one action.

A tool's block writes its tasks through its pairing with the runner. A project lists the runner's block, which brings this one.
