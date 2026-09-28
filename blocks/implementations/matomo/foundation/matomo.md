# Matomo

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

## matomo-data-layer-seeded-before-container · MUST
The data layer is seeded before Matomo's container script, and the script loads asynchronously.
**Why:** an event pushed before the container arrives waits in the data layer instead of being lost, and the page never waits for the service.
**Check:** review
**Tags:** performance
