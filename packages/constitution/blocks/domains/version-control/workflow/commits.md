# Commits

> Governs a commit's message: its header, its type and its body.

## Message

### commit-header-type-and-subject · MUST

A commit's header makes it a **conventional commit**, by Conventional Commits 1.0.0. Its form is `type: Subject`, with one of four types: **`feat`**, written `feat:`, adds behaviour; `fix:` fixes a bug; `refactor:` changes structure without changing behaviour; `chore:` is everything else that changes no behaviour — dependencies, tooling, documentation, releases. A breaking change is marked by `!` right before the colon, as in `feat!:`. No scope; at most 100 characters; the subject starts with a capital letter and is in the imperative.

| Why |
|---|
| a header in free form cannot be read by the release automation, and each type beyond the four is one more a committer can choose wrong — Conventional Commits. |

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
