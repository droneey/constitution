# Commits

> Governs a commit: what it holds, what it says, and the check it passes on the main line.

## What it holds

### commit-holds-only-its-task-files → change-limited-to-its-task · MUST

A commit holds only the files of its task, never whatever else lies in the working copy.

| Why |
|---|
| a commit of whatever lies around carries a scratch file, a key or a build output into the history. |

## What it says

### commit-subject-says-what-changed · SHOULD

A commit's subject says what the change does. It never says which files the change touched, and is never a placeholder such as “update”, “wip” or “fix stuff”.

| Why |
|---|
| a subject that names files or says “update” repeats what the diff lists, so the history holds no line that says what the change means, and whoever searches or bisects it must read every diff. |

### reason-for-change-recorded · SHOULD

The reason for a change is written down beside the change. It goes where the project's workflow puts it — a change request, an issue — never only in a conversation.

| Why |
|---|
| the next person who reads the change needs its reason, and a chat is not where they will look. |

## Main line

### main-line-commit-passes-the-check · MUST

Every commit of the main line passes the repository's check.

| Why |
|---|
| a commit of the main line that fails the check breaks every bisect and every revert that lands on it. |
