# Tracking

> Governs how page views reach Matomo and how its container loads.

## General

### matomo-page-views-pushed-by-the-application → event-sent-once-per-occurrence · MUST

A single-page application pushes each page view itself, and the container's history trigger is off.

| Why |
|---|
| the trigger would record a second view of each screen the application pushes, under the address with its identifiers. |

### matomo-data-layer-seeded-before-container · MUST

The data layer is seeded before Matomo's container script, and the script loads asynchronously.

| Why |
|---|
| an event pushed before the container arrives waits in the data layer instead of being lost, and the page never waits for the service. |
