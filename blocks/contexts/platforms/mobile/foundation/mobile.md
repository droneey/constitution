# Mobile

### credentials-in-secure-storage → credentials-only-in-the-protected-store
Tokens, credentials and other secrets on the device live only in the system's secure storage, the keychain or keystore, never in plain asynchronous storage.

| Why | Tags |
|---|---|
| the keychain and the keystore are the stores the system encrypts and keeps from other apps, while plain storage is read by backups and by whoever holds the phone. | [security] |
