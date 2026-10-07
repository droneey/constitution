# Version control

> Governs commits, branches, change requests and what an agent may do.

## Commits

### commit-header-type-and-subject · MUST
A commit's header follows Conventional Commits 1.0.0 as `type: Subject`, with one of four types: `feat` adds behaviour; `fix` fixes a bug; `refactor` changes structure without changing behaviour; `chore` is everything else that changes no behaviour — dependencies, tooling, documentation, releases. A breaking change is marked by `!` right before the colon: `feat!: Split the settings`. No scope; at most 100 characters; the subject starts with a capital letter and is in the imperative.

| Why | Tags |
|---|---|
| four types say all a reader and the release automation need, and a type nobody chooses between cannot be chosen wrong. | [] |

### commit-type-matches-the-diff · SHOULD
A commit's type matches what its diff does, and `!` marks every change a consumer must adapt to.

| Why | Tags |
|---|---|
| the type tells a reader and the release automation what the change does, so a wrong type mislabels it in the history and in the version. | [] |

### commit-body-empty-and-footer-only-trailers · MUST
A commit's body is empty, and its footer holds only trailers such as `Signed-off-by`.

| Why | Tags |
|---|---|
| the reason is reviewed in the change request, and a body written beside it is a second account nobody reviews; a trailer is data a tool reads. | [] |

### commit-checked-by-the-hooks · MUST
The commit hooks hold what can be checked of a commit before it is made: its branch's name, its message and its staged files.

| Why | Tags |
|---|---|
| a failure stopped before the commit never reaches the history, and the person who caused it sees it while the change is in mind. | [testing] |

## Branches

### branch-named-type-issue-name · MUST
A branch is named `feature/`, `fix/` or `hotfix/`, then `<issue>-<name>`: the issue's number, and a name of lowercase words and digits joined by hyphens. An update bot's branches are exempt.

| Why | Tags |
|---|---|
| the name ties the branch to its issue and tells the release automation which version to bump. | [] |

## Change requests

### changes-reach-main-line-through-review · MUST
Every change reaches the main line through a reviewed change request; the release automation's version commit and tag are the one exception.

| Why | Tags |
|---|---|
| review is the last point where a person sees the change before it ships, and a change that skips it ships unseen. | [] |

### change-request-lands-as-one-commit · MUST
A change request reaches the main line as one commit, and no work-in-progress or fix-up commit reaches it.

| Why | Tags |
|---|---|
| one commit per change keeps the main line readable and revertible change by change, and a work-in-progress commit there is a state nobody meant to ship. | [] |

### change-request-reviewable-in-one-sitting → change-limited-to-its-task · SHOULD
A change request is small enough to review in one sitting, and one that mixes concerns is split.

| Why | Tags |
|---|---|
| a reviewer reads a small change closely and skims a large one. | [] |

### change-request-description-holds-the-reason · MUST
A change request's description holds the reason for the change, the migration of a breaking change and the issue it closes.

| Why | Tags |
|---|---|
| the description is where a reviewer reads why, and what is missing there is decided without it. | [] |

## Files

### working-notes-stay-out-of-history · SHOULD
Design documents, plans and working notes live in a `local/` folder that version control ignores.

| Why | Tags |
|---|---|
| working notes are true for a day, and committed they mislead every later reader. | [] |

## Agents

### agent-never-merges → person-decides-what-is-recorded-or-shipped · MUST
An agent never merges a change request; the person who answers for it does.

| Why | Tags |
|---|---|
| merging is the decision that ships a change, and it belongs to the person who answers for it. | [] |

### agent-never-pushes-to-the-main-line → person-decides-what-is-recorded-or-shipped · MUST
An agent never pushes to the main line, even where its rights would allow it.

| Why | Tags |
|---|---|
| a holder of admin rights may pass the protection, so an agent that holds them is the last guard against the push. | [security] |

### agent-never-force-pushes → agent-asks-before-an-irreversible-action · MUST
An agent never force-pushes, to any branch.

| Why | Tags |
|---|---|
| history others have fetched is theirs as much as the agent's, and a rewrite of it is lost work nobody asked for. | [] |
