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

### matomo-tracks-no-personal-data → event-carries-no-personal-data · MUST
Tracked URLs carry no identifiers or query values, custom dimensions carry no personal data, and the instance anonymises addresses. A single-page application pushes its page views itself, with the route's template as the URL — `/chats/:id` — and the container's history trigger is off.

| Why | Tags |
|---|---|
| a URL or a dimension is the easiest way personal data leaks into a third party's reports. | [] |

### matomo-data-layer-seeded-before-container · MUST
The data layer is seeded before Matomo's container script, and the script loads asynchronously.

| Why | Tags |
|---|---|
| an event pushed before the container arrives waits in the data layer instead of being lost, and the page never waits for the service. | [performance] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `analytics-stores-nothing-until-consent` | `requireConsent`, `requireCookieConsent`, cookieless mode | yes |
| `analytics-anonymous-by-default` | address anonymisation on the instance; `setUserId` is never called | yes |
| `analytics-loads-without-blocking` | the container script loads asynchronously; a push onto the data layer never waits | yes |
