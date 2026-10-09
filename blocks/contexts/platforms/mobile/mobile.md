---
id: mobile
summary: Code that runs as an application on a phone or tablet.
requires: [untrusted-client]
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Mobile

> A program installed on a phone or tablet. The operating system suspends and ends it, the network comes and goes, and the device holds what the user can read.

### credentials-in-secure-storage → client-credential-kept-in-the-protected-store · MUST
Tokens, credentials and other secrets on the device live only in the system's secure storage, the keychain or keystore, never in plain asynchronous storage.

| Why | Tags |
|---|---|
| the keychain and the keystore are the stores the system encrypts and keeps from other apps, while plain storage is read by backups and by whoever holds the phone. | [security] |
