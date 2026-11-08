# People

> Governs the backups and restores of owned data that holds personal data.

## Backups

### backup-expires-within-its-retention · MUST

Every backup of owned data that holds personal data expires within the retention period the project sets for its backups.

| Why |
|---|
| a backup kept without an end keeps every erased person's data for as long as it lives. |

### restore-re-applies-erasures · MUST

Every restore of a backup of owned data re-applies every erasure made since the backup was taken.

| Why |
|---|
| a restore that skips them brings back the data of every person who asked for it to be gone. |
