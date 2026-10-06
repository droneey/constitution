# Untrusted client

### client-holds-nothing-hidden → secret-never-in-url-or-artefact
Nothing shipped to the client — code, configuration, a variable the build inlines under a public prefix, data in memory or in storage — is treated as hidden from its user, so none of it holds a secret; configuration the client receives at runtime is public.

| Why | Tags |
|---|---|
| the user controls the device, and every byte on it can be read and changed. | [security] |

### client-checks-repeated-on-server · MUST
Every check on the client — validation, permission, limit, price — is repeated where the client cannot reach it.

| Why | Tags |
|---|---|
| a client check is for the user's convenience; a modified client skips it. | [security] |

### credentials-only-in-the-protected-store · MUST
A credential the client holds for its user — a session, a token — lives only in the store the platform protects from other code on the device, never in storage that other code — another script, another app, a backup — can read.

| Why | Tags |
|---|---|
| code the program does not control — an injected script, a compromised dependency, another app, a backup — reads plain storage and sends what it finds away. | [security] |
