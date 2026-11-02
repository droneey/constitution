# Security

> Governs what a client holds and what it checks.

## What it holds

### client-holds-nothing-hidden → secret-kept-out-of-output · MUST

A client holds nothing hidden from its user. Nothing shipped to it — code, configuration, a value the build inlines under a public prefix, data in memory or in storage — is treated as hidden, so none of it holds a secret; configuration the client receives at runtime is public.

| Why |
|---|
| the user controls the device and can read and change every byte on it, so a secret shipped there is handed to every user. |

### client-credential-kept-in-the-protected-store · MUST

A client keeps its user's credential only in the store the platform protects. The credential — a session, a token — never lives in storage other code on the device — another script, another app, a backup — can read.

| Why |
|---|
| code the program does not control (an injected script, a compromised dependency, another app) reads plain storage and sends what it finds away. |

## What it checks

### client-check-repeated-out-of-its-reach · MUST

Every check on the client is repeated where the client cannot reach it. This holds for every kind of check, such as a validation, a permission, a limit or a price.

| Why |
|---|
| a client check is for the user's convenience, and a modified client skips it. |
