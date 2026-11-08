# Tracking

> Governs how page views reach Matomo.

## General

### matomo-page-views-pushed-by-the-program → event-sent-once-per-occurrence · MUST

A program that changes its screen without loading a document pushes each page view itself. The tag manager's History Change trigger is off.

| Why |
|---|
| the trigger would record a second view of each screen the program pushes, under the address with its identifiers. |
