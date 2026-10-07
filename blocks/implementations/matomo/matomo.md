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

### matomo-waits-for-consent → tracking-waits-for-consent · MUST
`requireConsent` is set before the first push, and tracking starts only on the consent the user gave.

| Why | Tags |
|---|---|
| without it, Matomo tracks from the first page view, before the user has chosen. | [] |

### matomo-tracks-no-personal-data → no-personal-data-in-events · MUST
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
| `analytics-consent-first` | `requireConsent`, `requireCookieConsent`, cookieless mode | yes |
| `analytics-anonymous-by-default` | address anonymisation on the instance; no user id unless `setUserId` is called | yes |
| `analytics-loads-without-blocking` | the container script loads asynchronously; a push onto the data layer never waits | yes |
| `analytics-context-dimensions` | a custom dimension set once applies to later hits | yes |
