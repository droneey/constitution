# Storage

> Governs the backups of owned data and its encryption at rest.

## Backups

### owned-data-backed-up · MUST

Owned data is backed up. It is backed up often enough to lose no more than the recovery point the project sets, into a place a fault or an attacker of the store cannot reach.

| Why |
|---|
| owned data has no other copy, and a backup in reach of what destroyed the store goes with it. |

### backup-restored-on-a-schedule · SHOULD

A backup is restored on a schedule into a place apart and checked.

| Why |
|---|
| a backup never restored is a hope, and the day it is needed is the day it fails. |

## Encryption

### owned-data-encrypted-at-rest · MUST

Owned data and its backups are encrypted at rest. Their keys are kept apart from them.

| Why |
|---|
| a disk, a snapshot or a backup that leaves the store's control is read by whoever holds it, unless it is encrypted with a key that did not leave with it — defence in depth. |
