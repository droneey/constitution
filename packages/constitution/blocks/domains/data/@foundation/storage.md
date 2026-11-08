# Storage

> Governs the backups of the data the program owns and its encryption at rest.

## Backups

### owned-data-backed-up · MUST

Every store the program owns whose data has no other copy is backed up to the recovery point the project sets. Its backups come often enough that a fault loses no more than that point.

| Why |
|---|
| data with no other copy is gone for good when a fault destroys it after the last backup, while a projection or a cache is built again from its source. |

### backup-kept-beyond-the-stores-reach · MUST

Every backup is kept where a fault or an attacker of the store it copies cannot reach it.

| Why |
|---|
| a backup in reach of what destroyed the store goes with it. |

### backup-restored-on-a-schedule · SHOULD

Every store's backups are restored on a schedule into a place apart and checked.

| Why |
|---|
| a backup never restored is a hope, and the day it is needed is the day it fails. |

## Encryption

### owned-data-encrypted-at-rest · MUST

Every store the program owns, and each of its backups, is encrypted at rest.

| Why |
|---|
| a disk, a store snapshot or a backup that leaves the store's control is read by whoever holds it — defence in depth. |

### at-rest-key-kept-apart-from-its-data · MUST

Every key that encrypts owned data or its backups at rest is kept apart from what it encrypts.

| Why |
|---|
| a key that leaves with the disk, the store snapshot or the backup it encrypts opens it for whoever holds them. |
