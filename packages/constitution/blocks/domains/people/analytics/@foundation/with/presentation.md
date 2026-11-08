# Presentation

> Governs page views.

## Page views

### page-view-named-by-route-template · MUST

Every page view names its screen by its route template, never by its screen address with its identifiers or query values.

| Why |
|---|
| a page view named by its full screen address splits one screen into a row per identifier, and sends every identifier in the screen address to the analytics service. |
