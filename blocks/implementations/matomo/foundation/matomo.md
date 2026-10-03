# Matomo

## matomo-waits-for-consent → tracking-waits-for-consent
`requireConsent` is set before the first push, and tracking starts only on the consent the user gave.

| Why | Check | Tags |
|---|---|---|
| without it, Matomo tracks from the first page view, before the user has chosen. | review | [] |

## matomo-tracks-no-personal-data → no-personal-data-in-events
Tracked URLs carry no identifiers or query values, custom dimensions carry no personal data, and the instance anonymises addresses. A single-page application pushes its page views itself, with the route's template as the URL — `/chats/:id` — and the container's history trigger is off.

| Why | Check | Tags |
|---|---|---|
| a URL or a dimension is the easiest way personal data leaks into a third party's reports. | review | [] |

## matomo-data-layer-seeded-before-container · MUST
The data layer is seeded before Matomo's container script, and the script loads asynchronously.

| Why | Check | Tags |
|---|---|---|
| an event pushed before the container arrives waits in the data layer instead of being lost, and the page never waits for the service. | review | [performance] |
