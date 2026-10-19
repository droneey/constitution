# Consistency

> Governs concurrent changes and the invariants the store holds.

## Concurrent changes

### stored-record-carries-its-version → write-on-read-data-is-conditional · MUST

A stored record that a write decides on from a read made in an earlier request carries a version the store checks on that write, and a write made on an older version is refused as a conflict.

| Why | Tags |
|---|---|
| the version is how the store tells a write made on a stale read from a fresh one. | [data] |

## Invariants

### invariant-also-held-by-the-store · SHOULD

An invariant the store can express — a uniqueness, a reference, a required value, a range — is also declared in the store as a constraint, beside the check in the code.

| Why | Tags |
|---|---|
| two concurrent writes each pass the code's check, and only the store sees them together. | [data] |
