# Commits

> Governs a version-control commit's message: its header, its type and its body.

## Vocabulary

A **commit type** is one of **`feat:`**{#feat-commit}, **`fix:`**{#fix-commit}, **`refactor:`**{#refactor-commit} and **`chore:`**{#chore-commit}: `feat:` adds behaviour; `fix:` fixes a bug; `refactor:` changes structure without changing behaviour; `chore:` is everything else that changes no behaviour, such as dependencies, tooling, documentation and numbered releases.

## Header

### commit-header-follows-conventional-commits · MUST

Every version-control commit's header is a conventional commit, `type: Subject`, by Conventional Commits 1.0.0, with one of the four commit types and no scope. The type may carry `!` right before the colon, as in `feat!:`.

#### Why

A header in free form cannot be read by the release automation, and each type beyond the four is one more a committer can choose wrong — Conventional Commits.

#### Examples

```text title="Avoid"
Refund rounding fix
feat(refunds): Add partial refunds
docs: Describe the refund flow
```

```text title="Prefer"
fix: Round refund totals to the cent
feat: Add partial refunds
chore: Describe the refund flow
```

### commit-header-within-100-characters · MUST

Every version-control commit's header holds at most 100 characters.

#### Why

A longer header is truncated in every list of the repository history and in the release notes made from it, so the end of its subject is lost to its readers.

#### Examples

```text title="Avoid"
feat: Add partial refunds for paid orders, with a refund per returned item, its invoice and a mail to the customer
```

```text title="Prefer"
feat: Refund paid orders one returned item at a time
```

### commit-subject-in-the-imperative · SHOULD

Every version-control commit's subject is in the imperative, as an order to the code.

#### Why

Subjects in mixed moods read as a log of what happened instead of what each version-control commit does, and the release notes made from them read in mixed voices.

#### Examples

```text title="Avoid"
fix: Rounded invoice totals to the cent
feat: Adds partial refunds
```

```text title="Prefer"
fix: Round invoice totals to the cent
feat: Add partial refunds
```

### commit-subject-opens-with-a-capital · MUST

Every version-control commit's subject opens with a capital letter.

#### Why

A convention left open is written both ways, so the repository history and the release notes made from it read unevenly, and a check of the header cannot tell a slip from a choice.

#### Examples

```text title="Avoid"
fix: round invoice totals to the cent
```

```text title="Prefer"
fix: Round invoice totals to the cent
```

## Type

### commit-type-matches-the-diff · SHOULD

Every version-control commit's type matches what its diff does.

#### Why

The type tells a reader and the release automation what the change does, so a wrong type mislabels it in the repository history and in the version.

#### Examples

```text title="Avoid"
refactor: Extract the tax calculation
  - total = net + net * 0.2
  + total = net + roundToCent(net * taxRate(country))
```

```text title="Prefer"
fix: Charge each country's tax rate
  - total = net + net * 0.2
  + total = net + roundToCent(net * taxRate(country))
```

### commit-breaking-change-marked · MUST

Every version-control commit whose change a consumer has to adapt to carries `!` right before the colon of its header.

#### Why

An unmarked break is released by the release automation as a version its consumers trust not to break them, and every consumer who trusts it breaks on update.

#### Examples

```text title="Avoid"
feat: Return order totals as minor units
  - "total": "120.00"
  + "total": 12000
```

```text title="Prefer"
feat!: Return order totals as minor units
  - "total": "120.00"
  + "total": 12000
```

## Body

### commit-body-left-empty · MUST

Every version-control commit's body is left empty.

#### Why

The reason is reviewed in the change request, and a body written beside it is a second account nobody reviews.

#### Examples

```text title="Avoid"
fix: Round invoice totals to the cent

Totals of three or more lines were off by a cent
because each line was rounded before the sum.
```

```text title="Prefer"
fix: Round invoice totals to the cent
```

### commit-footer-holds-only-trailers · MUST

Every version-control commit's footer holds only trailers, such as `Signed-off-by`.

#### Why

A trailer is data a tool reads, and prose in the footer is a body by another name that no tool can parse and nobody reviews.

#### Examples

```text title="Avoid"
fix: Round invoice totals to the cent

Thanks to Ann for spotting this one!
Signed-off-by: Dan Roe <dan@shop.example>
```

```text title="Prefer"
fix: Round invoice totals to the cent

Reported-by: Ann Lee <ann@shop.example>
Signed-off-by: Dan Roe <dan@shop.example>
```
