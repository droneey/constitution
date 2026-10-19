---
id: matomo
summary: Matomo as one of the product's analytics services.
requires: [analytics, browser, typescript]
extends: null
abstract: false
languages: []
dictionary: [Matomo, _mtm, _paq]
governs: ["**/matomo.sink.ts"]
---

# Matomo

> An analytics service.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `analytics-stores-nothing-until-consent` | `requireConsent`, `requireCookieConsent`, cookieless mode | yes |
| `analytics-drops-the-ip-address` | address anonymisation on the instance; `setUserId` is never called | yes |
