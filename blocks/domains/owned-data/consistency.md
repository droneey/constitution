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

### owned-data-backed-up · MUST
Owned data is backed up, often enough to lose no more than the recovery point the project sets, into a place a fault or an attacker of the store cannot reach.

| Why | Tags |
|---|---|
| owned data has no other copy, and a backup in reach of what destroyed the store goes with it. | [data] |

### backup-restored-on-a-schedule · SHOULD
A backup is restored on a schedule into a place apart and checked.

| Why | Tags |
|---|---|
| a backup never restored is a hope, and the day it is needed is the day it fails. | [data] |
