---
id: version-control
kind: domain
summary: Changes made atomically, checked, and integrated through review.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# Version control

> What holds for any version control: how a change is cut, checked, reviewed and integrated, the formats of commits, branches and release tags, and how history and releases are kept. The tool's own commands and files belong to the tool's block.

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

## commit-header-type-and-subject · MUST
A commit's header follows Conventional Commits 1.0.0 as `type: Subject`, with one of four types: `feat` adds a feature; `fix` fixes a bug; `refactor` changes structure without changing behaviour; `chore` is everything else that changes no behaviour — dependencies, tooling, documentation, releases. A breaking change is marked by `!` right before the colon: `feat!: Split the settings`. No scope; at most 100 characters; the subject starts with a capital letter and is in the imperative.
**Why:** four types say all a reader and the release automation need, and a type nobody chooses between cannot be chosen wrong.
**Check:** tool — commits
**Tags:** workflow, naming

## commit-body-empty-reason-in-pull-request · MUST
A commit's body and footer are empty. The reason for the change, the migration of a breaking change and the issue it closes live in the pull request description.
**Why:** the pull request is where the reason is reviewed, and a squash merge keeps one clean subject per change.
**Check:** tool — commits
**Tags:** workflow
**Implements:** `reason-for-change-recorded`

## commit-type-matches-the-diff · SHOULD
The type matches the diff: `feat` adds behaviour, `fix` corrects it, `refactor` and `chore` change none; `!` marks every change a consumer must adapt to.
**Why:** the type sets the version bump and the changelog, so a wrong type ships a wrong version.
**Check:** review
**Tags:** workflow
**Implements:** `refactor-apart-from-behaviour-change`

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

## Branches

## branch-named-type-issue-name · MUST
A branch is named `feature/`, `fix/` or `hotfix/`, then `<issue>-<kebab-name>`. A dependency bot's branches are exempt.
**Why:** the name ties the branch to its issue and tells the release automation which version to bump.
**Check:** tool — commits
**Tags:** workflow, naming

## branch-type-sets-version-bump · SHOULD
The type of the merged branch sets the version bump: `feature` a minor one; `fix`, `hotfix` and dependency updates a patch.
**Why:** the bump is decided when the branch is named, by the person who knows what it holds, not guessed at release time.
**Check:** review
**Tags:** workflow
**Implements:** `release-cut-by-automation-promoted-by-person`

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

## squash-merge-titled-in-commit-format · MUST
Pull requests are squash-merged; the title becomes the commit's subject and follows the commit format.
**Why:** one commit per change keeps the main line readable, revertible and in the format the release automation reads.
**Check:** review
**Tags:** workflow
**Implements:** `one-integration-strategy-no-work-in-progress`

## pull-request-title-checked-in-ci · SHOULD
CI checks the pull request's title and branch name against the formats, since a local hook can be skipped and the title is typed on the forge.
**Why:** the squash title becomes the commit, and no local hook sees it.
**Check:** review
**Tags:** workflow
**Implements:** `commit-header-type-and-subject`

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

## release-tags-named-by-semver · MUST
A release tag is named `v<major>.<minor>.<patch>`.
**Why:** one naming scheme lets people and tools find every release and order them.
**Check:** review
**Tags:** workflow
**Implements:** `release-marked-by-immutable-tag`

## release-cut-by-automation-promoted-by-person · SHOULD
Releases are cut by automation from the merged changes; a person promotes a pre-release to a release.
**Why:** automation makes every release the same way, and the person decides when one is ready.
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
