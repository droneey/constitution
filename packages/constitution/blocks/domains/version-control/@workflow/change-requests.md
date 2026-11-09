# Change requests

> Governs how a change request is reviewed, described and merged.

## Vocabulary

A **change request** proposes a version-control branch's version-control commits for the main line and holds their review, on the forge, the service that hosts the shared repository history. A change is submitted, as core's agents chapter of the workflow axis means a submission, at the latest when its change request is opened, and accepted when the change request is merged into the main line; a push to the main line submits and accepts a change at once.

A change request's **joined commit** is the one version-control commit it lands on the main line as, its own version-control commits joined into it.

A **tracked issue** is a record of one part of the project's work, such as a task or a bug, kept by number in the project's tracker until a change closes it.

An **update bot** is the bot that proposes dependency updates, each on a version-control branch and in a change request of its own.

## Review

### changes-reach-main-line-through-review · MUST

Every change reaches the main line through a reviewed change request. Exempt: the release automation's release commit and release tag.

#### Why

Review is the last point where a person sees the change before it ships, and a change that skips it ships unseen.

#### Examples

```text title="Avoid"
main:  c3  d4 (fix: Round invoice totals, pushed directly)
```

```text title="Prefer"
change request #131  fix/131-invoice-rounding -> main
  review: approved by Ann Lee
main:  c3  d4 (fix: Round invoice totals (#131))
```

### change-request-reviewable-in-one-sitting · SHOULD

Every change request is small enough to review in one sitting.

#### Why

A reviewer reads a small change closely and skims a large one.

#### Examples

```text title="Avoid"
#140  feat: Add refunds, invoices and the new checkout
      94 files changed, +6,210 -1,874
```

```text title="Prefer"
#140  feat: Add refunds for paid orders
      12 files changed, +340 -28
#141  feat: Send an invoice for each refund
      7 files changed, +190 -12
```

## Description

### change-request-description-holds-the-reason → change-description-states-its-reason · SHOULD

Every change request's description holds the reason for the change.

#### Why

The description is where a reviewer reads why, and a change whose reason is missing there is reviewed without it.

#### Examples

```text title="Avoid"
feat: Add partial refunds

Adds a partial refund use case and its endpoint.
```

```text title="Prefer"
feat: Add partial refunds

Support refunds one returned item at a time:
customers who send back one item of three are
refunded in full today, by hand, by support.
```

### change-request-description-holds-the-migration · SHOULD

Every change request whose change a consumer has to adapt to holds, in its description, the upgrade path its consumers follow: the steps by which they adapt to it.

#### Why

A break described without its upgrade path is reviewed without anyone checking that consumers can follow it, and the release notes later have nothing to give them.

#### Examples

```text title="Avoid"
feat!: Return order totals as minor units

Totals are integers of cents now, not decimal strings.
```

```text title="Prefer"
feat!: Return order totals as minor units

Totals are integers of cents now, not decimal strings.

Upgrade path
1. Read `total` as an integer of cents.
2. Divide by 100 where a decimal amount is shown.
3. Drop the parsing of `total` as a string.
```

### change-request-names-the-issue-it-closes · SHOULD

Wherever the project tracks its work in tracked issues, every change request's description names the tracked issue it closes. Exempt: a change request of an update bot.

#### Why

A change request with no tracked issue cannot be traced to the need it answers, and its tracked issue stays open after it ships.

#### Examples

```text title="Avoid"
fix: Round invoice totals to the cent

Totals of three or more lines were off by a cent.
```

```text title="Prefer"
fix: Round invoice totals to the cent

Totals of three or more lines were off by a cent.

Closes #131
```

## Landing

### change-request-lands-as-one-commit · MUST

Every change request reaches the main line as its joined commit alone. No version-control commit made as work in progress or as a fix-up reaches the main line.

#### Why

One version-control commit per change keeps the main line readable and revertible change by change, and a version-control commit of work in progress there is a state nobody meant to ship.

#### Examples

```text title="Avoid"
main
  e5  wip
  f6  fix typo
  g7  feat: Add partial refunds
```

```text title="Prefer"
main
  g7  feat: Add partial refunds (#140)
```

### joined-commit-message-checked-before-the-merge · MUST

Every joined commit reaches the main line with a commit message checked before the merge and unchanged since. The check is the one the commit hooks run on a commit message.

#### Why

The joined commit is made on the forge at the merge, where no commit hook runs and whoever merges can still edit its message, and its header is the one the main line keeps and the release automation reads.

#### Examples

```text title="Avoid"
change request #140, title checked: feat: Add partial refunds
merge: message edited to "Partial refunds + fixes"
main:  g7  Partial refunds + fixes
```

```text title="Prefer"
change request #140, title checked: feat: Add partial refunds
merge: message taken from the checked title, not editable
main:  g7  feat: Add partial refunds (#140)
```
