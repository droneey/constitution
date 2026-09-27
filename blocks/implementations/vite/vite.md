---
id: vite
kind: implementation
summary: Vite builds and serves the bundle; the build is not the type gate.
chapters: []
requires: [typescript]
extends: null
abstract: false
checks: []
owns: [Vite, vite.config.ts, import.meta.env]
governs: ["vite.config.ts", "vite.*.config.ts"]
status: stable
---

# Vite

> Builds and serves the browser bundle.

## build-is-not-the-type-gate · SHOULD
The build does not check types: the check runs the compiler before the build.
**Why:** the build strips types without reading them, so a green build proves nothing about them.
**Check:** review
**Tags:** types, workflow
**Implements:** `compiler-is-the-type-gate`

## vite-public-env-holds-no-secret · MUST
Only variables with the public prefix reach the bundle, and each of them is public: none holds a secret.
**Why:** whatever reaches the bundle is readable by every user.
**Check:** review
**Tags:** security
**Implements:** `no-secret-in-client-code`

## one-build-for-every-environment · SHOULD
One build serves every environment: settings per environment are read at run time, never built in through `import.meta.env`; build values only carry facts of the build itself.
**Why:** the bundle tested in staging is the one promoted to production, unchanged.
**Check:** review
**Tags:** architecture
**Implements:** `runtime-configuration-served-beside-bundle`

## bundle-measured-against-budget · SHOULD
The build's output is measured against the bundle's size budget in the check, entry by entry.
**Why:** the budget holds only if every build is measured against it.
**Check:** review
**Tags:** performance
**Implements:** `bundle-size-budget`
