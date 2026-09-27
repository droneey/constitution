---
id: mobile
kind: context
summary: Code that runs as an application on a phone or tablet.
chapters: []
requires: [untrusted-client, unreliable-network]
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# Mobile

> A program installed on a phone or tablet. The operating system suspends and ends it, the network comes and goes, and the device holds what the user can read.

## navigation-params-hold-view-state · SHOULD
View state a deep link or a restart must reproduce lives in the navigation parameters, and a deep link's parameters are parsed like any untrusted input.
**Why:** a deep link is input from outside the app, and a view that is not in its parameters cannot be linked or restored.
**Check:** review
**Tags:** data, security
**Implements:** `untrusted-input-parsed-at-edge`

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

## device-capabilities-behind-ports · SHOULD
Permissions, notifications, background work, secure storage and sensors are reached through adapters behind ports, never from a screen.
**Why:** each capability then has one place that asks for permission and handles refusal, and a test can fake it.
**Check:** review
**Tags:** architecture
**Implements:** `real-effects-chosen-at-composition-root`

## credentials-in-secure-storage · MUST
Tokens and credentials live only in the system's secure storage.
**Why:** anything else on the device can be read by backups, other apps or whoever holds the phone.
**Check:** review
**Tags:** security
