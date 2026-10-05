# Version control

## Commits

## commit-header-type-and-subject · MUST
A commit's header follows Conventional Commits 1.0.0 as `type: Subject`, with one of four types: `feat` adds behaviour; `fix` fixes a bug; `refactor` changes structure without changing behaviour; `chore` is everything else that changes no behaviour — dependencies, tooling, documentation, releases. A breaking change is marked by `!` right before the colon: `feat!: Split the settings`. No scope; at most 100 characters; the subject starts with a capital letter and is in the imperative.

| Why | Check | Tags |
|---|---|---|
| four types say all a reader and the release automation need, and a type nobody chooses between cannot be chosen wrong. | review | [] |

## commit-header-format → commit-header-type-and-subject
A commit's header is `type: Subject` or `type!: Subject`, with one of `feat`, `fix`, `refactor` and `chore`, no scope, at most 100 characters, and a subject that starts with a capital letter.

| Why | Check | Tags |
|---|---|---|
| a header in one form is read the same way by people and by the release automation. | tool/commits | [] |

## commit-body-empty-reason-in-pull-request → reason-for-change-recorded · MUST
A commit's body and footer are empty. The reason for the change, the migration of a breaking change and the issue it closes live in the pull request description.

| Why | Check | Tags |
|---|---|---|
| the pull request is where the reason is reviewed, and a squash merge keeps one clean subject per change. | tool/commits | [] |

## commit-type-matches-the-diff → refactor-apart-from-behaviour-change
The type matches the diff: `feat` adds behaviour, `fix` corrects it, `refactor` and `chore` change none; `!` marks every change a consumer must adapt to.

| Why | Check | Tags |
|---|---|---|
| the type sets the version bump and the changelog, so a wrong type ships a wrong version. | review | [] |

## check-run-by-hooks-and-ci → every-commit-passes-the-check
The commit hooks run the check's fast part before each commit, and CI runs the same command, all of it.

| Why | Check | Tags |
|---|---|---|
| the hooks stop most failures before they are committed, and CI runs what is too slow for a hook, on a machine nobody set up by hand, so what passes locally passes in CI. | review | [] |

## secrets-scanned-before-each-commit → no-secret-in-repository
The commit hooks scan the staged changes for secrets before each commit.

| Why | Check | Tags |
|---|---|---|
| a secret stopped before the commit never reaches history, where it is compromised for good. | review | [] |

## Branches

## branch-named-type-issue-name · MUST
A branch is named `feature/`, `fix/` or `hotfix/`, then `<issue>-<name>`: the issue's number, and a name of lowercase words joined by hyphens, with no digit. A dependency bot's branches are exempt.

| Why | Check | Tags |
|---|---|---|
| the name ties the branch to its issue and tells the release automation which version to bump. | tool/commits | [] |

## branch-type-sets-version-bump → release-cut-by-automation-promoted-by-person
The type of the merged branch sets the version bump: `feature` a minor one; `fix`, `hotfix` and dependency updates a patch.

| Why | Check | Tags |
|---|---|---|
| the bump is decided when the branch is named, by the person who knows what it holds, not guessed at release time. | review | [] |

## merged-branch-deleted · SHOULD
A branch is deleted once it is merged.

| Why | Check | Tags |
|---|---|---|
| a list of live branches then shows the work in progress, not its history. | review | [] |

## Integration

## changes-reach-main-line-through-review · MUST
Every change reaches the main line through a reviewed pull request. The one exception is the release automation's version commit and tag.

| Why | Check | Tags |
|---|---|---|
| review is the last point where a person sees the change before it ships; a change that skips it ships unseen. | review | [] |

## main-line-takes-no-direct-push → main-line-protected
The protection also refuses a direct push to the main line; only the release automation pushes its version commit and tag.

| Why | Check | Tags |
|---|---|---|
| a direct push skips the review and the required check that every other change passes through. | review | [] |

## required-check-blocks-integration → one-check-command
The check runs in CI on every pull request, and a red check blocks the merge.

| Why | Check | Tags |
|---|---|---|
| a check that can be merged past protects nothing. | review | [testing] |

## one-integration-strategy-no-work-in-progress · MUST
A repository integrates by one strategy, which the protection enforces, and no work-in-progress or fix-up commit reaches the main line.

| Why | Check | Tags |
|---|---|---|
| one strategy keeps the history readable the same way everywhere, and work in progress on the main line is a state nobody meant to ship. | review | [] |

## small-reviewable-change-requests → scope-limited-to-the-task
A pull request is small enough to review in one sitting; one that mixes concerns is split.

| Why | Check | Tags |
|---|---|---|
| a reviewer reads a small change closely and skims a large one. | review | [] |

## squash-merge-titled-in-commit-format → one-integration-strategy-no-work-in-progress
Pull requests are squash-merged; the title becomes the commit's subject and follows the commit format.

| Why | Check | Tags |
|---|---|---|
| one commit per change keeps the main line readable, revertible and in the format the release automation reads. | review | [] |

## pull-request-title-checked-in-ci → commit-header-type-and-subject
CI checks the pull request's title and branch name against the formats, since a local hook can be skipped and the title is typed on the forge.

| Why | Check | Tags |
|---|---|---|
| the squash title becomes the commit, and no local hook sees it. | review | [] |

## History and releases

## release-tags-named-by-semver → release-marked-by-immutable-tag
A release tag is named `v<major>.<minor>.<patch>`.

| Why | Check | Tags |
|---|---|---|
| one naming scheme lets people and tools find every release and order them. | review | [] |

## release-cut-by-automation-promoted-by-person · SHOULD
Releases are cut by automation from the merged changes; a person promotes a pre-release to a release.

| Why | Check | Tags |
|---|---|---|
| automation makes every release the same way, and the person decides when one is ready. | review | [] |

## Dependencies

## dependencies-updated-by-bot · SHOULD
Dependency updates arrive as pull requests from an update bot, each passing the check before it is merged.

| Why | Check | Tags |
|---|---|---|
| updates that arrive on their own, small and checked, keep the project current without a risky update all at once. | review | [security] |

## Files

## working-notes-stay-out-of-history · SHOULD
Specs, plans and working notes live in a `local/` folder that version control ignores.

| Why | Check | Tags |
|---|---|---|
| working notes are true for a day; committed, they mislead every later reader. | review | [] |

## Agents

## agent-commits-only-when-asked → person-decides-what-is-recorded-or-shipped
The main agent commits only when a person asks it to, on the working branch.

| Why | Check | Tags |
|---|---|---|
| a commit records a decision under the person's name; the person makes it. | review | [] |

## agent-never-merges → person-decides-what-is-recorded-or-shipped
An agent never merges a pull request.

| Why | Check | Tags |
|---|---|---|
| merging is the decision that ships a change, and it belongs to the person who answers for it. | review | [] |

## agent-pushes-and-opens-pull-requests-when-asked → person-decides-what-is-recorded-or-shipped
An agent pushes a branch, its own or one others share, and opens a pull request only when a person asks.

| Why | Check | Tags |
|---|---|---|
| pushing and opening a pull request share a change, and the person who answers for it decides when it is shared. | review | [] |

## agent-never-pushes-to-the-main-line → main-line-takes-no-direct-push
An agent never pushes to the main line, even where its rights would pass the protection.

| Why | Check | Tags |
|---|---|---|
| a holder of admin rights may pass the protection, so an agent that holds them is the last guard against the push. | review | [] |

## sub-agent-never-commits-pushes-or-merges → sub-agent-only-does-the-work
A sub-agent never commits, never pushes and never merges.

| Why | Check | Tags |
|---|---|---|
| a sub-agent acts without the person watching, so every decision about the history stays with the agent the person talks to. | review | [] |

## agent-settings-overrides-ignored → agent-permissions-kept-with-the-project
Version control ignores each person's override file of the agent settings.

| Why | Check | Tags |
|---|---|---|
| a person's override then stays on their machine, and the settings every clone shares change only through a reviewed change. | review | [security] |

## agent-never-rewrites-shared-history → shared-history-never-rewritten
An agent never force-pushes, to any branch.

| Why | Check | Tags |
|---|---|---|
| history others have fetched is theirs as much as the agent's, and a rewrite of it is lost work that nobody asked for. | review | [] |

## no-attribution-in-commits-or-pull-requests → no-tool-attribution
No commit, its trailers included, and no pull request names the tool or model that helped write it.

| Why | Check | Tags |
|---|---|---|
| a trailer or a line added by a tool lands in the history for good, under the name of the person who answers for the change. | review | [] |
