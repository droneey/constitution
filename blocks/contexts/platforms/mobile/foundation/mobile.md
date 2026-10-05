# Mobile

## useful-offline-with-what-it-has · SHOULD
Offline, the app opens, shows the data it has cached, marked as such, and says which actions wait. A write made offline is queued, retried or refused, never lost silently.

| Why | Check | Tags |
|---|---|---|
| a phone is offline often; an app that is useless then fails its users every day. | review | [ux, data] |

## credentials-in-secure-storage → credentials-only-in-the-protected-store
Tokens, credentials and other secrets on the device live only in the system's secure storage, the keychain or keystore, never in plain asynchronous storage.

| Why | Check | Tags |
|---|---|---|
| the keychain and the keystore are the stores the system encrypts and keeps from other apps, while plain storage is read by backups and by whoever holds the phone. | review | [security] |
