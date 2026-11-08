# Tracking

> Governs how page views reach Matomo.

## General

### matomo-page-views-pushed-by-the-program → event-sent-once-per-occurrence · MUST

A program that changes its screen without loading a document pushes each page view itself. The tag manager's History Change trigger is off.

#### Why

The trigger would record a second view of each screen the program pushes, under the address with its identifiers.

#### Examples

```text title="Avoid"
Tag Manager, container "shop"
  Tag: Matomo Analytics, Pageview
  Trigger: History Change
```

```text title="Prefer"
Tag Manager, container "shop"
  Tag: Matomo Analytics, Pageview
  Trigger: none, the program pushes each page view
```
