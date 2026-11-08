# Commits

> Governs a version-control commit's message: its header, its type and its body.

## Vocabulary

A **commit type** is one of **`feat:`**{#feat-commit}, **`fix:`**{#fix-commit}, **`refactor:`**{#refactor-commit} and **`chore:`**{#chore-commit}: `feat:` adds behaviour; `fix:` fixes a bug; `refactor:` changes structure without changing behaviour; `chore:` is everything else that changes no behaviour, such as dependencies, tooling, documentation and numbered releases.

## Header

### commit-header-follows-conventional-commits · MUST

Every version-control commit's header is a conventional commit, `type: Subject`, by Conventional Commits 1.0.0, with one of the four commit types and no scope. The type may carry `!` right before the colon, as in `feat!:`.

| Why |
|---|
| a header in free form cannot be read by the release automation, and each type beyond the four is one more a committer can choose wrong — Conventional Commits. |

### commit-header-within-100-characters · MUST

Every version-control commit's header holds at most 100 characters.

| Why |
|---|
| a longer header is truncated in every list of the repository history and in the release notes made from it, so the end of its subject is lost to its readers. |

### commit-subject-in-the-imperative · SHOULD

Every version-control commit's subject is in the imperative, as an order to the code.

| Why |
|---|
| subjects in mixed moods read as a log of what happened instead of what each version-control commit does, and the release notes made from them read in mixed voices. |

### commit-subject-opens-with-a-capital · MUST

Every version-control commit's subject opens with a capital letter.

| Why |
|---|
| a convention left open is written both ways, so the repository history and the release notes made from it read unevenly, and a check of the header cannot tell a slip from a choice. |

## Type

### commit-type-matches-the-diff · SHOULD

Every version-control commit's type matches what its diff does.

| Why |
|---|
| the type tells a reader and the release automation what the change does, so a wrong type mislabels it in the repository history and in the version. |

### commit-breaking-change-marked · MUST

Every version-control commit whose change a consumer has to adapt to carries `!` right before the colon of its header.

| Why |
|---|
| an unmarked break is released by the release automation as a version its consumers trust not to break them, and every consumer who trusts it breaks on update. |

## Body

### commit-body-left-empty · MUST

Every version-control commit's body is left empty.

| Why |
|---|
| the reason is reviewed in the change request, and a body written beside it is a second account nobody reviews. |

### commit-footer-holds-only-trailers · MUST

Every version-control commit's footer holds only trailers, such as `Signed-off-by`.

| Why |
|---|
| a trailer is data a tool reads, and prose in the footer is a body by another name that no tool can parse and nobody reviews. |
