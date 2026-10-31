# Tracking

> Governs how page views reach Matomo.

## General

### matomo-page-views-pushed-by-the-application → event-sent-once-per-occurrence · MUST

A single-page application pushes each page view itself, and the container's history trigger is off.

| Why |
|---|
| the trigger would record a second view of each screen the application pushes, under the address with its identifiers. |
