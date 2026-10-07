# Consistency

> Governs concurrent changes, invariants and backups.

## Concurrent changes

### stored-record-carries-its-version → write-on-read-data-is-conditional · MUST
A stored record several writers change carries a version the store checks on every write, and a write made on an older version is refused as a conflict.

| Why | Tags |
|---|---|
| the version is how the store tells a write made on a stale read from a fresh one. | [data] |

## Invariants

### invariant-also-held-by-the-store · SHOULD
An invariant the store can express — a uniqueness, a reference, a required value, a range — is also declared in the store as a constraint, beside the check in the code.

| Why | Tags |
|---|---|
| two concurrent writes each pass the code's check, and only the store sees them together. | [data] |

## Backups

### backup-restored-on-a-schedule · SHOULD
Owned data is backed up, and a backup is restored on a schedule into a place apart and checked.

| Why | Tags |
|---|---|
| a backup never restored is a hope, and the day it is needed is the day it fails. | [data] |
