# Commits

> Governs a version-control commit: what it holds, what it says, and the check it passes on the main line.

## Vocabulary

A **commit message** is the text recorded with a version-control commit: its header, the first line, which holds its subject, the summary of what the version-control commit does; then an optional body; then a footer of trailers, the lines of `Key: value` a tool reads.

## What it holds

### commit-holds-only-its-task-files → change-limited-to-its-task · MUST

Every version-control commit holds only the files of its task, never whatever else lies in the working copy.

| Why |
|---|
| a version-control commit of whatever lies around carries a scratch file, a key or a build output into the repository history. |

## What it says

### commit-subject-says-what-changed · SHOULD

Every version-control commit's subject says what its change does. It never names the files the change touched, and is never a placeholder such as “update”, “wip” or “fix stuff”.

| Why |
|---|
| a subject that names files or says “update” repeats what the diff lists, so the repository history holds no line that says what the change means, and whoever searches or bisects it must read every diff. |

## Main line

### main-line-commit-passes-the-check · MUST

Every version-control commit of the main line passes the project's check.

| Why |
|---|
| a version-control commit of the main line that fails the check breaks every bisect and every revert that lands on it. |
