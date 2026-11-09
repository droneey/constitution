# History

> Governs shared repository history and what it may never hold.

## Vocabulary

The **repository history** is the record of the repository's version-control commits that its clones share, a **version-control commit** being one recorded change of the repository's files.

A **clone** is a copy of the repository that holds the whole repository history.

A **version-control branch** is a named line of version-control commits, and the **main line** is the version-control branch the project builds and ships from, which every change reaches last.

## General

### shared-history-never-rewritten · MUST

No repository history others have fetched is rewritten or deleted.

#### Why

A rewritten shared repository history breaks every copy built on it and can lose others' work.

#### Examples

```text title="Avoid"
main:  a1  b2  c3  (fetched by the team)

$ rewrite main to drop c3
main:  a1  b2
```

```text title="Prefer"
main:  a1  b2  c3  (fetched by the team)

$ revert c3
main:  a1  b2  c3  d4 (reverts c3)
```

### secret-in-history-counts-as-leaked → leaked-secret-rotated-at-once · MUST

Every secret that reached a version-control commit has leaked. It stays leaked once a later version-control commit removes it or the repository history is rewritten.

#### Why

Every clone made before the removal or the rewrite still holds the secret, and the rewrite only hides that it leaked.

#### Examples

```text title="Avoid"
c3  chore: Add payment settings   (holds PAYMENTS_KEY)
d4  chore: Remove the payment key

PAYMENTS_KEY: still in use
```

```text title="Prefer"
c3  chore: Add payment settings   (holds PAYMENTS_KEY)
d4  chore: Remove the payment key

PAYMENTS_KEY: revoked, a new key issued
```
