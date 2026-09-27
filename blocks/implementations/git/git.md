---
id: git
kind: implementation
summary: Git's commits, branches, tags, ignores and worktrees.
chapters: []
requires: [version-control]
extends: null
abstract: false
checks: []
owns: [Git, git, .gitignore, .gitattributes, .gitkeep, Git LFS, commit-msg, pre-commit]
governs: [".gitignore", ".gitattributes"]
status: stable
---

# Git

> Version control with git: the formats of commits and branches, how changes are staged, what is ignored, tags, large files and worktrees. A git-flow framework extends this block and may tighten it. The formats are checked by the commit hooks, under the `commits` role.

## Commits and branches

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

## Working with changes

## move-with-git-mv · SHOULD
With staged changes, a file is moved with `git mv`, so the index records a rename.
**Why:** a recorded rename keeps the file's history and shows the reviewer a move, not a deletion and a new file.
**Check:** review
**Tags:** workflow
**Implements:** `move-files-never-recreate`

## stage-by-name-and-read-staged-diff · MUST
Files are staged by name or by hunk, never with `git add .` or `-A`, and the staged diff and status are read before the commit.
**Why:** staging everything commits whatever lies around — a scratch file, a key, a build output.
**Check:** review
**Tags:** workflow, security

## worktree-one-branch-own-dependencies · MUST
A worktree holds one branch, and its dependencies are installed in it, never linked from another checkout.
**Why:** a linked dependency folder escapes the ignore pattern and gets committed, and two worktrees on one branch overwrite each other.
**Check:** review
**Tags:** workflow

## force-push-with-lease-to-own-branch-only · SHOULD
A force push goes only to one's own branch that nobody else has, and always with `--force-with-lease`.
**Why:** a force push to a shared branch erases others' work; the lease refuses when the branch moved.
**Check:** review
**Tags:** workflow
**Implements:** `shared-history-never-rewritten`

## clean-tree-with-safe-cleanup · SHOULD
A stash carries a message, and `git clean -n` precedes `git clean -fd`.
**Why:** an unnamed stash is forgotten, and a blind clean deletes work that was never committed.
**Check:** review
**Tags:** workflow
**Implements:** `working-copy-clean-at-hand-back`

## Ignores, tags and large files

## gitignore-covers-dependencies-output-and-caches · SHOULD
`.gitignore` covers dependencies, build output, coverage, logs, caches, temporary and backup files, the files of the operating system and of personal editors, and `/local/`. A tracked file that becomes ignored is untracked with `git rm --cached`.
**Why:** what the build or the machine produces never belongs in history, and an ignore rule alone does not untrack what is already there.
**Check:** review
**Tags:** workflow
**Implements:** `working-notes-stay-out-of-history`

## gitignore-covers-keys-and-environment-files · MUST
`.gitignore` covers key and credential files and every local environment file except its example — `.env*` but `.env.example`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `credentials.json`, `id_rsa`, `*.secrets`, `.htpasswd` — in nested ignore files too.
**Why:** one careless add of a key file publishes it; the ignore rule stops it before the scanner has to.
**Check:** review
**Tags:** security
**Implements:** `environment-names-declared-in-one-place`

## release-tags-annotated-semver · MUST
A release tag is annotated and named `v<major>.<minor>.<patch>`.
**Why:** an annotated tag records who tagged the release and when, and one naming scheme lets tools find every release.
**Check:** review
**Tags:** workflow
**Implements:** `release-marked-by-immutable-tag`

## lfs-for-files-over-a-megabyte · SHOULD
A file over 1 MB goes to Git LFS, or out of the repository.
**Why:** a large file in git's history is downloaded by every clone forever.
**Check:** review
**Tags:** performance
**Implements:** `large-files-outside-history`
