# Mobile

## state-survives-the-os-lifecycle · SHOULD
Going to the background, being suspended or being ended by the system loses no input and no view state.

| Why | Check | Tags |
|---|---|---|
| the system ends apps without asking, and a user who comes back expects to find what they left. | test | [ux, data] |

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

## deep-link-params-parsed-as-untrusted-input → outside-values-untyped-until-parsed
A deep link's path and query parameters reach a screen only after a schema parses them; a link that fails the parse opens a fallback screen, never a crash or a half-filled one.

| Why | Check | Tags |
|---|---|---|
| anyone can write a deep link and send it to the user, so a malformed one is to be expected, and it must not break the app. | review | [data] |
