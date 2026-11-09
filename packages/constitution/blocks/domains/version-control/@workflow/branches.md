# Branches

> Governs a version-control branch's name, its type and its end.

## Vocabulary

A **branch type** is the prefix of a version-control branch's name, one of **`feature/`**{#feature-branch}, **`fix/`**{#fix-branch}, **`hotfix/`**{#hotfix-branch}, **`refactor/`**{#refactor-branch} and **`chore/`**{#chore-branch}.

## General

### branch-named-type-issue-name · MUST

Every version-control branch is named by its branch type and a name of lowercase words and digits joined by hyphens, as `<type><name>`. Wherever the project tracks its work in tracked issues, its tracked issue's number and a hyphen come between the two, as `<type><issue>-<name>`. Exempt: the main line, and a version-control branch of an update bot.

#### Why

A version-control branch named without its tracked issue's number cannot be traced to its tracked issue, and one named without its type tells its reviewer and the release automation nothing of the kind of change it carries.

#### Examples

```text title="Avoid"
partial_refunds
dmytro/PartialRefunds
```

```text title="Prefer"
feature/140-partial-refunds
```

### branch-type-matches-its-commit-type · SHOULD

Every version-control branch takes the branch type of its change's commit type. That is `feature/` for `feat:`, `fix/` for `fix:` or `hotfix/` for a fix that ships at once, `refactor/` for `refactor:` and `chore/` for `chore:`. Exempt: the main line, and a version-control branch of an update bot.

#### Why

A version-control branch named under another change's type tells its reviewer and the release automation the wrong kind of change, so the change is reviewed and released as what it is not.

#### Examples

```text title="Avoid"
branch:  feature/131-invoice-rounding
commit:  fix: Round invoice totals to the cent
```

```text title="Prefer"
branch:  fix/131-invoice-rounding
commit:  fix: Round invoice totals to the cent
```

### merged-branch-deleted · SHOULD

Every version-control branch is deleted once its change request is merged.

#### Why

A merged version-control branch left behind invites a push that no longer reaches the main line, and the list of version-control branches stops saying what is in flight.

#### Examples

```text title="Avoid"
#140 merged
branches:  main  feature/140-partial-refunds  feature/152-gift-cards
```

```text title="Prefer"
#140 merged, its branch deleted
branches:  main  feature/152-gift-cards
```
