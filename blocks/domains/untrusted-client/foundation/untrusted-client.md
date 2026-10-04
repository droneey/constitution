# Untrusted client

## client-holds-nothing-hidden · MUST
Nothing shipped to the client — code, configuration, a variable the build inlines under a public prefix, data in memory or in storage — is treated as hidden from its user, so none of it holds a secret; configuration the client receives at runtime is public.

| Why | Check | Tags |
|---|---|---|
| the user controls the device, and every byte on it can be read and changed. | review | [security] |

## credentials-only-in-the-protected-store · MUST
A credential the client holds for its user — a session, a token — lives only in the store the platform protects from other code on the device, never in storage the program's own code or anything else on the device can read.

| Why | Check | Tags |
|---|---|---|
| code the program does not control — an injected script, a compromised dependency, another app, a backup — reads plain storage and sends what it finds away. | review | [security] |
