# People

> Governs the backups and restores of owned data that holds personal data.

## Backups

### backup-expires-within-its-retention · MUST

Every backup of owned data that holds personal data expires within the retention period the project sets for its backups.

#### Why

A backup kept without an end keeps every erased person's data for as long as it lives.

#### Examples

```text title="Avoid"
customers backups   hold names and addresses
  retention set     35 days
  expiry            none
```

```text title="Prefer"
customers backups   hold names and addresses
  retention set     35 days
  expiry            each deleted by the backup
                    store 35 days after it
                    was taken
```

### restore-re-applies-erasures · MUST

Every restore of a backup of owned data re-applies every erasure made since the backup was taken.

#### Why

A restore that skips them brings back the data of every person who asked for it to be gone.

#### Examples

```text title="Avoid"
restore customers from 2026-11-01
  1  load the backup
  2  open the store to traffic
```

```text title="Prefer"
restore customers from 2026-11-01
  1  load the backup
  2  re-apply every erasure logged
     since 2026-11-01
  3  open the store to traffic
```
