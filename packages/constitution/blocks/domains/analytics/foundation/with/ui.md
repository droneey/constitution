# User interface

> Governs page views.

## Page views

### page-view-named-by-route-template · MUST

A page view names its screen by its route template. The template is that of its address, never the address with its identifiers or query values.

| Why |
|---|
| a page view named by its full address splits one screen into a row per identifier, and sends every identifier in the address to the analytics service. |
