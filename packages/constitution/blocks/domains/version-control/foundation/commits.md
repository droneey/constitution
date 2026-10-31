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

A commit's subject says what the change does, never which files it touched and never a placeholder such as “update”, “wip” or “fix stuff”.

| Why |
|---|
| the diff already lists the files, so the subject is the only place in the history that says what the change means. |

### reason-for-change-recorded · SHOULD

The reason for a change is written down beside the change, where the project's workflow puts it — a change request, an issue — never only in a conversation.

| Why |
|---|
| the next person who reads the change needs its reason, and a chat is not where they will look. |

## Main line

### main-line-commit-passes-the-check → change-handed-back-with-a-passing-check · MUST

Every commit of the main line passes the repository's check.

| Why |
|---|
| a commit of the main line that fails the check breaks every bisect and every revert that lands on it. |
