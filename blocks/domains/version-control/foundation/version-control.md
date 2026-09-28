# Version control

## Commits

## commit-is-one-logical-change · SHOULD
A commit holds one logical change, and its subject says what changed.
**Why:** a change that does one thing can be reviewed, reverted and found in history as one thing.
**Check:** review
**Tags:** workflow

## refactor-apart-from-behaviour-change · SHOULD
A refactor and a change of behaviour are never one commit.
**Why:** a rollback of the behaviour then leaves the structure alone, and a reviewer sees which lines change what the program does.
**Check:** review
**Tags:** workflow

## every-commit-passes-the-check · MUST
Every commit passes the repository's check: the commit hooks run its fast part, CI runs all of it.
**Why:** a commit that fails the check breaks every bisect and every revert that lands on it.
**Check:** review
**Tags:** workflow, testing

## reason-for-change-recorded · SHOULD
The reason for a change is written down where the flow puts it, beside the change, not only in a conversation.
**Why:** the next person who reads the change needs its reason, and a chat is not where they will look.
**Check:** review
**Tags:** workflow

## commit-subject-states-what-changed · SHOULD
The subject states what changed, not which files were touched.
**Why:** the diff already lists the files; the subject is the only place that says what the change means.
**Check:** review
**Tags:** workflow
**Implements:** `commit-is-one-logical-change`

## no-placeholder-commit-subjects · MUST
Placeholder subjects are rejected: "update", "fix stuff", "wip", "changes", "misc".
**Why:** a placeholder subject makes the history useless at exactly the commit someone needs to understand.
**Check:** tool — commits
**Tags:** workflow

## Integration

## changes-reach-main-line-through-review · MUST
Every change reaches the main line through a reviewed pull request. The one exception is the release automation's version commit and tag.
**Why:** review is the last point where a person sees the change before it ships; a change that skips it ships unseen.
**Check:** review
**Tags:** workflow

## main-line-protected · MUST
The main line is protected: no direct push, no force push, no deletion.
**Why:** the main line is what every release is cut from; one careless push rewrites it for everyone.
**Check:** review
**Tags:** workflow, security

## required-check-blocks-integration · MUST
The check runs in CI on every pull request, and a red check blocks the merge.
**Why:** a check that can be merged past protects nothing.
**Check:** review
**Tags:** workflow, testing
**Implements:** `one-check-command`

## one-integration-strategy-no-work-in-progress · MUST
A repository integrates by one strategy, which the protection enforces, and no work-in-progress or fix-up commit reaches the main line.
**Why:** one strategy keeps the history readable the same way everywhere, and work in progress on the main line is a state nobody meant to ship.
**Check:** review
**Tags:** workflow

## small-reviewable-change-requests · SHOULD
A pull request is small enough to review in one sitting; one that mixes concerns is split.
**Why:** a reviewer reads a small change closely and skims a large one.
**Check:** review
**Tags:** workflow
**Implements:** `scope-limited-to-the-task`

## merged-branch-deleted · SHOULD
A branch is deleted once it is merged.
**Why:** a list of live branches then shows the work in progress, not its history.
**Check:** review
**Tags:** workflow

## working-copy-clean-at-hand-back · SHOULD
When work is handed back, the working copy holds no stray change and no scratch file outside ignored folders.
**Why:** a stray file is committed by the next person who stages everything, or confuses whoever picks the work up.
**Check:** review
**Tags:** workflow

## History and releases

## shared-history-never-rewritten · MUST
History others have is never rewritten.
**Why:** a rewritten shared history breaks every copy built on it and can lose others' work.
**Check:** review
**Tags:** workflow

## release-marked-by-immutable-tag · MUST
A release is marked by a tag of its version on the commit it was built from, and a tag never moves.
**Why:** a version must always name the same code, or a bug report against it cannot be reproduced.
**Check:** review
**Tags:** workflow

## large-files-outside-history · SHOULD
Large binary files live outside the history, stored by reference.
**Why:** a large file in history is downloaded by every clone forever, even after it is deleted.
**Check:** review
**Tags:** performance

## secret-in-history-is-compromised · MUST
A secret that reached the history is compromised: it is rotated at once, and rewriting the history does not undo the leak.
**Why:** every clone and every cache already holds it; only rotation makes it worthless.
**Check:** review
**Tags:** security
**Implements:** `leaked-secret-rotated-at-once`
