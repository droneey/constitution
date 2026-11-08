# Storage

> Governs the backups of the data the program owns and its encryption at rest.

## Backups

### owned-data-backed-up · MUST

Every store the program owns whose data has no other copy is backed up to the recovery point the project sets. Its backups come often enough that a fault loses no more than that point.

#### Why

Data with no other copy is gone for good when a fault destroys it after the last backup, while a projection or a cache is built again from its source.

#### Examples

```text title="Avoid"
store            orders
recovery point   15 minutes
backups          full, nightly at 02:00
```

```text title="Prefer"
store            orders
recovery point   15 minutes
backups          full, nightly at 02:00
                 write log shipped
                 every 5 minutes
```

### backup-kept-beyond-the-stores-reach · MUST

Every backup is kept where a fault or an attacker of the store it copies cannot reach it.

#### Why

A backup in reach of what destroyed the store goes with it.

#### Examples

```text title="Avoid"
orders store     account shop-production
orders backups   account shop-production,
                 same region,
                 deletable by the store's
                 admin credential
```

```text title="Prefer"
orders store     account shop-production
orders backups   account shop-backups,
                 another region,
                 write-once for 35 days,
                 deletable by no credential
                 of shop-production
```

### backup-restored-on-a-schedule · SHOULD

Every store's backups are restored on a schedule into a place apart and checked.

#### Why

A backup never restored is a hope, and the day it is needed is the day it fails.

#### Examples

```text title="Avoid"
orders backups
  taken      nightly
  restored   never
```

```text title="Prefer"
orders backups
  taken      nightly
  restored   every Monday, latest backup,
             into a store apart from
             production
  checked    orders and invoices counted
             against the source; newest
             order within the recovery
             point; a failure alerts
```

## Encryption

### owned-data-encrypted-at-rest · MUST

Every store the program owns, and each of its backups, is encrypted at rest.

#### Why

A disk, a store snapshot or a backup that leaves the store's control is read by whoever holds it — defence in depth.

#### Examples

```text title="Avoid"
orders store     encrypted at rest
orders backups   plain archives
```

```text title="Prefer"
orders store     encrypted at rest
orders backups   encrypted at rest
```

### at-rest-key-kept-apart-from-its-data · MUST

Every key that encrypts owned data or its backups at rest is kept apart from what it encrypts.

#### Why

A key that leaves with the disk, the store snapshot or the backup it encrypts opens it for whoever holds them.

#### Examples

```text title="Avoid"
backups/orders/
├── 2026-11-07.archive.enc
└── backup.key
```

```text title="Prefer"
backups/orders/
└── 2026-11-07.archive.enc   key: key-service/shop-backups/orders

key-service/shop-backups/orders   held by the key service,
                                  used only by the backup job
```
