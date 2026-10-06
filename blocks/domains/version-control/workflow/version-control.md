# Version control

## Commits

### commit-header-type-and-subject · MUST
A commit's header follows Conventional Commits 1.0.0 as `type: Subject`, with one of four types: `feat` adds behaviour; `fix` fixes a bug; `refactor` changes structure without changing behaviour; `chore` is everything else that changes no behaviour — dependencies, tooling, documentation, releases. A breaking change is marked by `!` right before the colon: `feat!: Split the settings`. No scope; at most 100 characters; the subject starts with a capital letter and is in the imperative.

| Why | Tags |
|---|---|
| four types say all a reader and the release automation need, and a type nobody chooses between cannot be chosen wrong. | [] |

### commit-body-empty-reason-in-pull-request · MUST
A commit's body and footer are empty. The reason for the change, the migration of a breaking change and the issue it closes live in the pull request description.

| Why | Tags |
|---|---|
| the pull request is where the reason is reviewed, and a squash merge keeps one clean subject per change. | [] |

### commit-type-matches-the-diff · SHOULD
The type matches the diff: `feat` adds behaviour, `fix` corrects it, `refactor` and `chore` change none; `!` marks every change a consumer must adapt to.

| Why | Tags |
|---|---|
| the type tells a reader and the project's release tooling what the change does, so a wrong type mislabels it in the history. | [] |

### commit-checked-by-the-hooks · MUST
The commit hooks hold what can be checked of a commit before it is made: its branch's name, its message and its staged files.

| Why | Tags |
|---|---|
| a failure stopped before the commit never reaches the history, and the person who caused it sees it while the change is in mind. | [testing] |

### secrets-scanned-before-each-commit → secret-never-in-the-repository
The commit hooks scan the staged changes for secrets before each commit.

| Why | Tags |
|---|---|
| a secret stopped before the commit never reaches history, where it is compromised for good. | [] |

## Branches

### branch-named-type-issue-name · MUST
A branch is named `feature/`, `fix/` or `hotfix/`, then `<issue>-<name>`: the issue's number, and a name of lowercase words joined by hyphens, with no digit. A dependency bot's branches are exempt.

| Why | Tags |
|---|---|
| the name ties the branch to its issue and tells the release automation which version to bump. | [] |

### merged-branch-deleted · SHOULD
A branch is deleted once it is merged.

| Why | Tags |
|---|---|
| a list of live branches then shows the work in progress, not its history. | [] |

## Integration

### changes-reach-main-line-through-review · MUST
Every change reaches the main line through a reviewed pull request. The one exception is the release automation's version commit and tag.

| Why | Tags |
|---|---|
| review is the last point where a person sees the change before it ships; a change that skips it ships unseen. | [] |

### main-line-takes-no-direct-push · MUST
The protection also refuses a direct push to the main line; only the release automation pushes its version commit and tag.

| Why | Tags |
|---|---|
| a direct push skips the review and the required check that every other change passes through. | [security] |

### one-integration-strategy-no-work-in-progress · MUST
A repository integrates by one strategy, which the protection enforces, and no work-in-progress or fix-up commit reaches the main line.

| Why | Tags |
|---|---|
| one strategy keeps the history readable the same way everywhere, and work in progress on the main line is a state nobody meant to ship. | [] |

### small-reviewable-change-requests → change-limited-to-its-task
A pull request is small enough to review in one sitting; one that mixes concerns is split.

| Why | Tags |
|---|---|
| a reviewer reads a small change closely and skims a large one. | [] |

### squash-merge-titled-in-commit-format · MUST
Pull requests are squash-merged; the title becomes the commit's subject and follows the commit format.

| Why | Tags |
|---|---|
| one commit per change keeps the main line readable, revertible and in the format the release automation reads. | [] |

## Dependencies

### dependencies-updated-by-bot · SHOULD
Dependency updates arrive as pull requests from an update bot, each passing the check before it is merged.

| Why | Tags |
|---|---|
| updates that arrive on their own, small and checked, keep the project current without a risky update all at once. | [security] |

## Files

### working-notes-stay-out-of-history · SHOULD
Specs, plans and working notes live in a `local/` folder that version control ignores.

| Why | Tags |
|---|---|
| working notes are true for a day; committed, they mislead every later reader. | [] |

## Agents

### agent-commits-only-when-asked → person-decides-what-is-recorded-or-shipped
The main agent commits only when a person asks it to, on the working branch.

| Why | Tags |
|---|---|
| a commit records a decision under the person's name; the person makes it. | [] |

### agent-never-merges → person-decides-what-is-recorded-or-shipped
An agent never merges a pull request.

| Why | Tags |
|---|---|
| merging is the decision that ships a change, and it belongs to the person who answers for it. | [] |

### agent-pushes-and-opens-pull-requests-when-asked → person-decides-what-is-recorded-or-shipped
An agent pushes a branch, its own or one others share, and opens a pull request only when a person asks.

| Why | Tags |
|---|---|
| pushing and opening a pull request share a change, and the person who answers for it decides when it is shared. | [] |

### agent-never-pushes-to-the-main-line · MUST
An agent never pushes to the main line, even where its rights would pass the protection.

| Why | Tags |
|---|---|
| a holder of admin rights may pass the protection, so an agent that holds them is the last guard against the push. | [security] |

### sub-agent-never-commits-pushes-or-merges → sub-agent-only-does-the-work
A sub-agent never commits, never pushes and never merges.

| Why | Tags |
|---|---|
| a sub-agent acts without the person watching, so every decision about the history stays with the agent the person talks to. | [] |

### agent-never-force-pushes · MUST
An agent never force-pushes, to any branch.

| Why | Tags |
|---|---|
| history others have fetched is theirs as much as the agent's, and a rewrite of it is lost work that nobody asked for. | [] |

### no-attribution-in-commits-or-pull-requests → submission-follows-the-receivers-disclosure-policy
No commit, its trailers included, and no pull request names the tool or model that helped write it.

| Why | Tags |
|---|---|
| a trailer or a line added by a tool lands in the history for good, under the name of the person who answers for the change. | [] |
