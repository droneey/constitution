# Suppressions

> Governs where the reason for a yamllint suppression stands.

## General

### yamllint-reason-on-the-line-above → suppression-states-its-reason · MUST

Every yamllint suppression has its reason in a comment on the line above it, never on the suppression's own line.

#### Why

Yamllint takes a directive only when nothing follows its rule list, so a reason written on its line voids it, the finding stays reported, and the reason is dropped to make the suppression work.

#### Examples

```yaml title="Avoid"
signature: MEUCIQDf2r8kZ0x9vQ7n1sYh4uXgP3cKd5wR8tLmN6bVaE2jHwIgS9pQ1rT4uV7xY0zA3bC6dE9fG2hJ5kL8mN1oP4qR7s  # yamllint disable-line rule:line-length -- a signature cannot wrap
```

```yaml title="Prefer"
# Why: a signature is one token, which cannot wrap.
# yamllint disable-line rule:line-length
signature: MEUCIQDf2r8kZ0x9vQ7n1sYh4uXgP3cKd5wR8tLmN6bVaE2jHwIgS9pQ1rT4uV7xY0zA3bC6dE9fG2hJ5kL8mN1oP4qR7s
```
