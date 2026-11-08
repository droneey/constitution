# Suppressions

> Governs where the reason for a yamllint suppression stands.

## General

### yamllint-reason-on-the-line-above → suppression-states-its-reason · MUST

Every yamllint suppression has its reason in a comment on the line above it, never on the suppression's own line.

| Why |
|---|
| yamllint takes a directive only when nothing follows its rule list, so a reason written on its line voids it, the finding stays reported, and the reason is dropped to make the suppression work. |
