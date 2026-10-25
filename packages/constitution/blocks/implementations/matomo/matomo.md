---
id: matomo
summary: Matomo as one of the product's analytics services.
requires: [analytics, browser, typescript]
extends: null
abstract: false
languages: []
governs: ["**/matomo.sink.ts"]
---

# Matomo

> **Matomo**, an analytics service, which the page feeds through the queues of its tracker, **`_paq`**, and of its tag manager, **`_mtm`**.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `analytics-stores-nothing-until-consent` | `requireConsent`, `requireCookieConsent`, cookieless mode | yes |
| `analytics-drops-the-ip-address` | address anonymisation on the instance; `setUserId` is never called | yes |
