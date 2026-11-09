# Presentation

> Governs page views.

## Page views

### page-view-named-by-route-template · MUST

Every page view names its screen by its route template, never by its screen address with its identifiers or query values.

#### Why

A page view named by its full screen address splits one screen into a row per identifier, and sends every identifier in the screen address to the analytics service.

#### Examples

```pseudo title="Avoid"
# presentation/navigation/page-views
function onNavigated(location, analytics)
  call analytics.send(pageViewed({ screen: location.address }))
# "/orders/8812?tab=lines"
```

```pseudo title="Prefer"
# presentation/navigation/page-views
function onNavigated(location, analytics)
  call analytics.send(pageViewed({ screen: location.route.template }))
```
