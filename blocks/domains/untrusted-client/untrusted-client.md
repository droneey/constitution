---
id: untrusted-client
kind: domain
summary: Code that runs where its user can read and change it.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# Untrusted client

> A property several platforms share: the program runs on a device its user controls. Whatever it holds, the user can read; whatever it checks, the user can skip.

## client-holds-nothing-hidden · MUST
Nothing shipped to the client — code, configuration, data in memory or in storage — is treated as hidden from its user.
**Why:** the user controls the device, and every byte on it can be read and changed.
**Check:** review
**Tags:** security

## no-secret-in-client-code · MUST
No secret is in client code, a client bundle or a value built into it. Configuration the client receives at runtime is public.
**Why:** a secret that reaches the client is published to every user.
**Check:** review
**Tags:** security
**Implements:** `secret-never-in-url-or-artefact`

## client-checks-repeated-on-server · MUST
Every check on the client — validation, permission, limit, price — is repeated where the client cannot reach it.
**Why:** a client check is for the user's convenience; a modified client skips it.
**Check:** review
**Tags:** security
**Implements:** `access-denied-unless-granted`
