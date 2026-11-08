# Presentation

> Governs the address a page view sends to Matomo.

## General

### matomo-custom-url-set-to-the-route-template → page-view-named-by-route-template · MUST

Every page view the program pushes is preceded by `setCustomUrl` with its screen's route template.

| Why |
|---|
| the tracker otherwise sends the page's own address, with the identifiers and the query values a screen address holds. |
