# Consistency

> Governs concurrent changes, invariants, backups and the connection to the store.

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

### owned-data-encrypted-at-rest · MUST
Owned data and its backups are encrypted at rest, with keys kept apart from them.

| Why | Tags |
|---|---|
| a disk, a snapshot or a backup that leaves the store's control is unreadable without its key. | [data, security] |

### backup-restored-on-a-schedule · SHOULD
A backup is restored on a schedule into a place apart and checked.

| Why | Tags |
|---|---|
| a backup never restored is a hope, and the day it is needed is the day it fails. | [data] |

## Connections

### store-reached-over-verified-tls · MUST
A connection to a store or a broker the program owns that crosses a network runs over TLS, with the server's certificate verified.

| Why | Tags |
|---|---|
| a connection inside a private network is still read by whoever reaches that network, and one that skips the certificate trusts whoever answers. | [security] |
