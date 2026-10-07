---
id: version-control
summary: Changes checked, history and releases kept, and what agents may do.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Version control

> What holds for any version control: how a change is cut and checked, which files history keeps, and how history and releases are kept; how it is reviewed and integrated, the formats of commits and branches, and what an agent may commit, push and merge, are in `workflow/`. The tool's own commands and files belong to the tool's block.

## Commits

### commit-is-one-logical-change → change-limited-to-its-task · SHOULD
A commit holds one logical change, which can be reviewed, reverted and found in the history on its own.

| Why | Tags |
|---|---|
| a commit that mixes two changes cannot revert one without the other, and the history names neither. | [] |

### commit-holds-only-its-task-files → change-limited-to-its-task · MUST
A commit holds only the files of its task, never whatever else lies in the working copy.

| Why | Tags |
|---|---|
| a commit of whatever lies around carries a scratch file, a key or a build output into the history. | [security] |

### commit-subject-says-what-changed · SHOULD
A commit's subject says what the change does, never which files it touched and never a placeholder such as “update”, “wip” or “fix stuff”.

| Why | Tags |
|---|---|
| the diff already lists the files, so the subject is the only place in the history that says what the change means. | [] |

### reason-for-change-recorded · SHOULD
The reason for a change is written down beside the change, where the project's workflow puts it — a change request, an issue — never only in a conversation.

| Why | Tags |
|---|---|
| the next person who reads the change needs its reason, and a chat is not where they will look. | [] |

## Main line

### main-line-commit-passes-the-check → change-handed-back-with-a-passing-check · MUST
Every commit of the main line passes the repository's check.

| Why | Tags |
|---|---|
| a commit of the main line that fails the check breaks every bisect and every revert that lands on it. | [testing] |

## History

### shared-history-never-rewritten · MUST
History others have fetched is never rewritten or deleted, the main line's least of all.

| Why | Tags |
|---|---|
| a rewritten shared history breaks every copy built on it and can lose others' work. | [] |

### secret-in-history-counts-as-leaked → leaked-secret-rotated-at-once · MUST
A secret that reached any commit has leaked, even when a later commit removed it, and is rotated; rewriting the history does not undo the leak.

| Why | Tags |
|---|---|
| every clone made before the removal or the rewrite still holds the secret, and the rewrite only hides that it leaked. | [security] |

### release-marked-by-immutable-tag · MUST
A release is marked by a tag of its version on the commit it was built from, and the tag is never moved, deleted or reused.

| Why | Tags |
|---|---|
| a version must always name the same code, and a tag that can be moved or made again lets whoever controls it swap the code under everyone who uses that version. | [security] |

## Files

### large-files-outside-history · SHOULD
A large binary file lives outside the history, which keeps only a reference to it.

| Why | Tags |
|---|---|
| a large file in the history is downloaded by every clone for ever, even after it is deleted. | [performance] |

### generated-files-not-committed · SHOULD
A generated file is not committed; the build produces it. Two kinds are committed: a file an author's step generates and the code imports, which no build produces, and a copy kept for readers outside the code, such as a schema an editor fetches by its address.

| Why | Tags |
|---|---|
| a committed build output drifts from its source and fills every diff, while a fresh clone's type check needs the generated files the code imports, and a reader outside the code finds a copy only where it is committed. | [] |

### machine-local-files-ignored · SHOULD
Files local to one machine — the local environment file, a person's overrides of the project's tools — are ignored by version control.

| Why | Tags |
|---|---|
| what belongs to one machine stays on it and changes nobody else's setup. | [security] |

### environment-example-holds-only-placeholders · SHOULD
The committed example of the local environment file holds a placeholder for every value, never a real one.

| Why | Tags |
|---|---|
| a real value in the example becomes every machine's value, and a real secret there has leaked. | [security] |

### text-stored-with-one-line-ending · MUST
Text is stored in the history with one line ending, whatever the platform of the person who commits it.

| Why | Tags |
|---|---|
| mixed line endings fill diffs with lines nobody changed and break scripts on the other platform. | [] |

### working-copy-clean-at-hand-back · SHOULD
When work is handed back, the working copy holds no stray change and no scratch file outside the ignored folders.

| Why | Tags |
|---|---|
| a stray file is committed by the next person who stages everything, or confuses whoever picks the work up. | [] |
