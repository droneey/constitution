# Version control

## Commits

## commit-header-type-and-subject · MUST
A commit's header follows Conventional Commits 1.0.0 as `type: Subject`, with one of four types: `feat` adds a feature; `fix` fixes a bug; `refactor` changes structure without changing behaviour; `chore` is everything else that changes no behaviour — dependencies, tooling, documentation, releases. A breaking change is marked by `!` right before the colon: `feat!: Split the settings`. No scope; at most 100 characters; the subject starts with a capital letter and is in the imperative.
**Why:** four types say all a reader and the release automation need, and a type nobody chooses between cannot be chosen wrong.
**Check:** tool — commits
**Tags:** process, naming

## commit-body-empty-reason-in-pull-request · MUST
A commit's body and footer are empty. The reason for the change, the migration of a breaking change and the issue it closes live in the pull request description.
**Why:** the pull request is where the reason is reviewed, and a squash merge keeps one clean subject per change.
**Check:** tool — commits
**Tags:** process
**Implements:** `reason-for-change-recorded`

## commit-type-matches-the-diff · SHOULD
The type matches the diff: `feat` adds behaviour, `fix` corrects it, `refactor` and `chore` change none; `!` marks every change a consumer must adapt to.
**Why:** the type sets the version bump and the changelog, so a wrong type ships a wrong version.
**Check:** review
**Tags:** process
**Implements:** `refactor-apart-from-behaviour-change`

## Branches

## branch-named-type-issue-name · MUST
A branch is named `feature/`, `fix/` or `hotfix/`, then `<issue>-<kebab-name>`. A dependency bot's branches are exempt.
**Why:** the name ties the branch to its issue and tells the release automation which version to bump.
**Check:** tool — commits
**Tags:** process, naming

## branch-type-sets-version-bump · SHOULD
The type of the merged branch sets the version bump: `feature` a minor one; `fix`, `hotfix` and dependency updates a patch.
**Why:** the bump is decided when the branch is named, by the person who knows what it holds, not guessed at release time.
**Check:** review
**Tags:** process
**Implements:** `release-cut-by-automation-promoted-by-person`

## Integration

## squash-merge-titled-in-commit-format · MUST
Pull requests are squash-merged; the title becomes the commit's subject and follows the commit format.
**Why:** one commit per change keeps the main line readable, revertible and in the format the release automation reads.
**Check:** review
**Tags:** process
**Implements:** `one-integration-strategy-no-work-in-progress`

## pull-request-title-checked-in-ci · MUST
CI checks the pull request's title and branch name against the formats, since a local hook can be skipped and the title is typed on the forge.
**Why:** the squash title becomes the commit, and no local hook sees it.
**Check:** review
**Tags:** process
**Implements:** `commit-header-type-and-subject`

## History and releases

## release-tags-named-by-semver · MUST
A release tag is named `v<major>.<minor>.<patch>`.
**Why:** one naming scheme lets people and tools find every release and order them.
**Check:** review
**Tags:** process
**Implements:** `release-marked-by-immutable-tag`

## release-cut-by-automation-promoted-by-person · SHOULD
Releases are cut by automation from the merged changes; a person promotes a pre-release to a release.
**Why:** automation makes every release the same way, and the person decides when one is ready.
**Check:** review
**Tags:** process
