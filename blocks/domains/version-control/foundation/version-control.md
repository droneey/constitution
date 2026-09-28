# Version control

## Commits

## commit-is-one-logical-change · SHOULD
A commit holds one logical change, and its subject says what changed, not which files were touched.

| Why | Check | Tags |
|---|---|---|
| a change that does one thing can be reviewed, reverted and found in history as one thing; the diff already lists the files, so the subject is the only place that says what the change means. | review | [] |

## refactor-apart-from-behaviour-change · SHOULD
A refactor and a change of behaviour are never one commit.

| Why | Check | Tags |
|---|---|---|
| a rollback of the behaviour then leaves the structure alone, and a reviewer sees which lines change what the program does. | review | [] |

## every-commit-passes-the-check · MUST
Every commit passes the repository's check.

| Why | Check | Tags |
|---|---|---|
| a commit that fails the check breaks every bisect and every revert that lands on it. | review | [testing] |

## reason-for-change-recorded · SHOULD
The reason for a change is written down beside the change, where the project's workflow puts it — a commit body, a change request — not only in a conversation.

| Why | Check | Tags |
|---|---|---|
| the next person who reads the change needs its reason, and a chat is not where they will look. | review | [] |

## no-placeholder-commit-subjects · MUST
Placeholder subjects are rejected: "update", "fix stuff", "wip", "changes", "misc".

| Why | Check | Tags |
|---|---|---|
| a placeholder subject makes the history useless at exactly the commit someone needs to understand. | tool — commits | [] |

## Integration

## main-line-protected · MUST
The main line is protected: no force push, no deletion.

| Why | Check | Tags |
|---|---|---|
| the main line is what every release is cut from; one careless push rewrites it for everyone. | review | [security] |

## working-copy-clean-at-hand-back · SHOULD
When work is handed back, the working copy holds no stray change and no scratch file outside ignored folders.

| Why | Check | Tags |
|---|---|---|
| a stray file is committed by the next person who stages everything, or confuses whoever picks the work up. | review | [] |

## History and releases

## shared-history-never-rewritten · MUST
History others have is never rewritten.

| Why | Check | Tags |
|---|---|---|
| a rewritten shared history breaks every copy built on it and can lose others' work. | review | [] |

## release-marked-by-immutable-tag · MUST
A release is marked by a tag of its version on the commit it was built from, and a tag never moves.

| Why | Check | Tags |
|---|---|---|
| a version must always name the same code, or a bug report against it cannot be reproduced. | review | [] |

## large-files-outside-history · SHOULD
Large binary files live outside the history, stored by reference.

| Why | Check | Tags |
|---|---|---|
| a large file in history is downloaded by every clone forever, even after it is deleted. | review | [performance] |
