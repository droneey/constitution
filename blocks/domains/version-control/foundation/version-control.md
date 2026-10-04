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
No commit of the history holds a secret, even one a later commit removed it from, and the secret scanner reads the whole history.

| Why | Check | Tags |
|---|---|---|
| a secret removed from the working tree stays in every clone of the history. | review | [security] |

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
Generated files are not committed; the build produces them. A file an author's step generates and the program's code imports — not a build output — is the exception, and is committed.

| Why | Check | Tags |
|---|---|---|
| a committed copy of something the build produces drifts from its source and fills every diff, but the type check of a fresh clone needs the files the code imports, and the check may not generate them. | review | [] |

## local-environment-file-ignored · SHOULD
The local environment file is ignored by version control; its committed example carries placeholders only.

| Why | Check | Tags |
|---|---|---|
| the real values stay on the machine they belong to, and a real value never lands in the example. | review | [security] |

## CI

## ci-steps-pinned-to-immutable-references · MUST
A third-party step of CI is pinned to an immutable reference, never to a moving tag or branch.

| Why | Check | Tags |
|---|---|---|
| a moving reference lets its owner, or an attacker who owns it, change the code the pipeline runs with its secrets. | review | [security] |
