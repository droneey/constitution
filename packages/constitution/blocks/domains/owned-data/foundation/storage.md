# Storage

> Governs the backups of owned data, its encryption at rest, and the connection to its store.

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

A connection to a store the program owns that crosses a network runs over TLS — the program's own, or that of a proxy on its host that verifies for it — which verifies the server's certificate and its name, and never turns the verification off.

| Why | Tags |
|---|---|
| a connection inside a private network is still read by whoever reaches that network, and one that skips the certificate trusts whoever answers. | [security] |
