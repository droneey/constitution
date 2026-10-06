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

## commit-holds-only-its-task-files → commit-is-one-logical-change · MUST
A commit holds only the files of its task.

| Why | Check | Tags |
|---|---|---|
| a commit of whatever lies around carries a scratch file, a key or a build output into the history. | review | [security] |

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
| a placeholder subject makes the history useless at exactly the commit someone needs to understand. | tool/commits | [] |

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

## no-secret-in-history → no-secret-in-repository
No commit of the history holds a secret, even one a later commit removed it from.

| Why | Check | Tags |
|---|---|---|
| a secret removed from the working tree stays in every clone of the history. | review | [security] |

## secret-in-history-rotated-not-rewritten → leaked-secret-rotated-at-once
A secret that reached a commit is rotated like any other leak; rewriting the history does not undo it.

| Why | Check | Tags |
|---|---|---|
| every clone made before the rewrite still holds the secret, and the rewrite only hides that it leaked. | review | [security] |

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

## Files

## move-files-never-recreate · MUST
A file that moves is moved, never deleted and written anew, and a moved file is not rewritten in the same step.

| Why | Check | Tags |
|---|---|---|
| a move keeps the file's history and shows the reviewer that nothing changed but its place. | review | [] |

## generated-files-not-committed · SHOULD
Generated files are not committed; the build produces them. Two kinds are the exception, and are committed: a file an author's step generates and the program's code imports — not a build output — and a generated copy kept for readers outside the code, such as a schema an editor fetches by its address.

| Why | Check | Tags |
|---|---|---|
| a committed copy of something the build produces drifts from its source and fills every diff, but the type check of a fresh clone needs the files the code imports, which the check may not generate, and a reader outside the code finds a copy only where it is committed. | review | [] |

## machine-local-files-ignored · SHOULD
Files local to one machine — the local environment file, a person's overrides of the project's tools — are ignored by version control; the environment file's committed example carries placeholders only.

| Why | Check | Tags |
|---|---|---|
| what belongs to one machine stays on it and changes no one else's setup, and a real value never lands in the example. | review | [security] |
