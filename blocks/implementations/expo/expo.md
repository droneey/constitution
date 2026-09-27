---
id: expo
kind: implementation
summary: Expo on React Native — app config, native builds, secure storage.
chapters: []
requires: []
extends: react-native
abstract: false
checks: []
owns: [Expo, EAS, Expo Router, app.config.ts, eas.json]
governs: ["app.config.ts", "eas.json"]
status: stable
---

# Expo

> React Native through Expo. Written thin, like its base: the rest waits for the first mobile project.

## native-projects-generated-by-prebuild · SHOULD
The native projects are generated from `app.config.ts` and config plugins, never committed or edited by hand.
**Why:** a hand-edited native project drifts from the configuration and is lost on the next generation.
**Check:** review
**Tags:** workflow
**Implements:** `generated-files-marked-never-edited`

## expo-public-env-holds-no-secret · MUST
Variables with the public prefix are built into the bundle, so none holds a secret.
**Why:** everything in the bundle is readable by anyone who installs the app.
**Check:** review
**Tags:** security
**Implements:** `no-secret-in-client-code`

## device-secrets-in-secure-store · MUST
Tokens and secrets on the device live in the system keychain through secure storage, never in plain asynchronous storage.
**Why:** plain storage is readable from backups and by anyone who holds the device.
**Check:** review
**Tags:** security
**Implements:** `credentials-in-secure-storage`

## expo-router-root-is-routes · SHOULD
Expo Router's root is `src/routes/`, so `app` keeps its meaning as a feature's layer.
**Why:** the router's default `src/app/` would give one word two meanings in one tree.
**Check:** tool — names
**Tags:** naming, architecture
**Implements:** `anatomy-top-level-by-concern`

## native-modules-at-sdk-versions · SHOULD
Native modules are installed at the versions the SDK supports, and the check verifies them with `expo install --check`.
**Why:** a native module at another version builds and then crashes on a device.
**Check:** review
**Tags:** workflow
