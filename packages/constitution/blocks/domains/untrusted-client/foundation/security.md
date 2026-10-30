# Security

> Governs what a client holds and what it checks.

## What it holds

### client-holds-nothing-hidden → secret-kept-out-of-output · MUST

Nothing shipped to the client — code, configuration, a value the build inlines under a public prefix, data in memory or in storage — is treated as hidden from its user, so none of it holds a secret; configuration the client receives at runtime is public.

| Why |
|---|
| the user controls the device, and every byte on it can be read and changed. |

### client-credential-kept-in-the-protected-store · MUST

A credential the client holds for its user — a session, a token — lives only in the store the platform protects from other code on the device, never in storage that other code — another script, another app, a backup — can read.

| Why |
|---|
| code the program does not control — an injected script, a compromised dependency, another app — reads plain storage and sends what it finds away. |

## What it checks

### client-check-repeated-out-of-its-reach · MUST

Every check on the client — validation, permission, limit, price — is repeated where the client cannot reach it.

| Why |
|---|
| a client check is for the user's convenience, and a modified client skips it. |
