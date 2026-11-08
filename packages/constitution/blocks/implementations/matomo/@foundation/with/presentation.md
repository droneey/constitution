# Presentation

> Governs the address a page view sends to Matomo.

## General

### matomo-custom-url-set-to-the-route-template → page-view-named-by-route-template · MUST

Every page view the program pushes is preceded by `setCustomUrl` with its screen's route template.

#### Why

The tracker otherwise sends the page's own address, with the identifiers and the query values a screen address holds.

#### Examples

```ts title="Avoid"
router.subscribe('onResolved', () => {
  paq.push(['trackPageView', document.title]);
});
```

```ts title="Prefer"
router.subscribe('onResolved', () => {
  const match = router.state.matches.at(-1);
  paq.push(['setCustomUrl', match?.routeId ?? '/']);
  paq.push(['trackPageView', document.title]);
});
```
