# Commits

> Governs a commit's message and the hooks that check it: how they are installed, what they rewrite and what they refuse.

## General

### commit-header-type-and-subject · MUST

A commit's header makes it a **conventional commit**, by Conventional Commits 1.0.0: `type: Subject`, with one of four types: **`feat`**, written `feat:`, adds behaviour; `fix:` fixes a bug; `refactor:` changes structure without changing behaviour; `chore:` is everything else that changes no behaviour — dependencies, tooling, documentation, releases. A breaking change is marked by `!` right before the colon, as in `feat!: Split the settings`. No scope; at most 100 characters; the subject starts with a capital letter and is in the imperative.

| Why |
|---|
| four types say all a reader and the release automation need, and a type nobody chooses between cannot be chosen wrong. |

### commit-type-matches-the-diff · SHOULD

A commit's type matches what its diff does, and `!` marks every change a consumer must adapt to.

| Why |
|---|
| the type tells a reader and the release automation what the change does, so a wrong type mislabels it in the history and in the version. |

### commit-body-empty-and-footer-only-trailers · MUST

A commit's body is empty, and its footer holds only trailers such as `Signed-off-by`.

| Why |
|---|
| the reason is reviewed in the change request, and a body written beside it is a second account nobody reviews; a trailer is data a tool reads. |

### commit-checked-by-the-hooks · MUST

A **commit hook** runs as a commit is made. The commit hooks hold what can be checked of a commit before it is made: its branch's name, its message and its staged files.

| Why |
|---|
| a failure stopped before the commit never reaches the history, and the person who caused it sees it while the change is in mind. |

### hooks-installed-on-setup · SHOULD

Setting up a clone installs the commit hooks, so none commits without them; never through a package manager's install script.

| Why |
|---|
| hooks a person must remember to install are missing on exactly the machine that needs them, and an install script runs on every install of a dependency, wherever it comes from. |

### hooks-never-bypassed · MUST

No commit skips the commit hooks, save the release automation's version commit.

| Why |
|---|
| a skipped hook lets through exactly the commit the hook exists to stop. |

### hook-rewrites-only-staged-files · MUST

A commit hook that formats rewrites only the staged files and stages them again.

| Why |
|---|
| a hook that touches unstaged files mixes work in progress into the commit. |

### commit-subject-never-a-placeholder · MUST

The commit hooks reject a placeholder subject: "update", "fix stuff", "wip", "changes", "misc".

| Why |
|---|
| a placeholder subject makes the history useless at exactly the commit someone needs to understand. |
