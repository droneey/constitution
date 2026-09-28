# Mobile

## state-survives-the-os-lifecycle · SHOULD
Going to the background, being suspended or being ended by the system loses no input and no view state.
**Why:** the system ends apps without asking, and a user who comes back expects to find what they left.
**Check:** test
**Tags:** ux, data

## useful-offline-with-what-it-has · SHOULD
Offline, the app opens, shows the data it has cached, marked as such, and says which actions wait. A write made offline is queued, retried or refused, never lost silently.
**Why:** a phone is offline often; an app that is useless then fails its users every day.
**Check:** review
**Tags:** ux, data

## credentials-in-secure-storage · MUST
Tokens, credentials and other secrets on the device live only in the system's secure storage, the keychain or keystore, never in plain asynchronous storage.
**Why:** anything else on the device can be read by backups, other apps or whoever holds the phone.
**Check:** review
**Tags:** security
