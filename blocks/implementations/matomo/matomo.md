---
id: matomo
kind: implementation
summary: Matomo as an analytics sink behind the analytics port.
chapters: []
requires: [analytics, typescript]
extends: null
abstract: false
checks: []
owns: [Matomo, _mtm, _paq]
governs: ["**/matomo.sink.ts"]
status: stable
---

# Matomo

> An analytics service, reached through one sink.

## matomo-only-in-its-sink · MUST
Only the Matomo sink knows Matomo — its data layer, and the container's address taken from configuration. It seeds the data layer before the container script, which loads asynchronously.
**Why:** the service is replaced or removed as one file, and nothing else in the program knows it exists.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `sinks-behind-one-contract`

## matomo-waits-for-consent · MUST
`requireConsent` is set before the first push, and tracking starts only on the consent the user gave.
**Why:** without it, Matomo tracks from the first page view, before the user has chosen.
**Check:** review
**Tags:** security
**Implements:** `tracking-waits-for-consent`

## matomo-tracks-no-personal-data · MUST
Tracked URLs carry no identifiers or query values, custom dimensions carry no personal data, and the instance anonymises addresses.
**Why:** a URL or a dimension is the easiest way personal data leaks into a third party's reports.
**Check:** review
**Tags:** security
**Implements:** `no-personal-data-in-events`

## Requirements

| Requirement | How in Matomo | Status |
|---|---|---|
| `analytics-consent-first` | `requireConsent`, `requireCookieConsent`, cookieless mode | met |
| `analytics-anonymous-by-default` | address anonymisation on the instance; no user id unless `setUserId` is called | met |
| `analytics-loads-without-blocking` | the container script loads asynchronously; a push onto the data layer never waits | met |
| `analytics-context-dimensions` | a custom dimension set once applies to later hits | met |
