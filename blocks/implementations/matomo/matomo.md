---
id: matomo
summary: Matomo as one of the product's analytics services.
requires: [analytics, typescript]
extends: null
abstract: false
checks: []
dictionary: [Matomo, _mtm, _paq]
governs: ["**/matomo.sink.ts"]
---

# Matomo

> An analytics service.

## Requirements

| Requirement | How in Matomo | Status |
|---|---|---|
| `analytics-consent-first` | `requireConsent`, `requireCookieConsent`, cookieless mode | met |
| `analytics-anonymous-by-default` | address anonymisation on the instance; no user id unless `setUserId` is called | met |
| `analytics-loads-without-blocking` | the container script loads asynchronously; a push onto the data layer never waits | met |
| `analytics-context-dimensions` | a custom dimension set once applies to later hits | met |
