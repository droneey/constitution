# Deployment

> Governs how a tab reads the settings of its deployment environment.

## Settings

### served-configuration-read-at-boot → environment-setting-reaches-the-artefact-from-its-host · MUST

Every tab reads its host's settings once, before the program starts. It reads them from a source such as a file the host serves beside the bundle or the document its server renders.

#### Why

A tab has no environment variables of its host to read, so a setting not taken from what its host serves, a file beside the bundle or the document its server renders, is built into the bundle and carries one deployment environment's values wherever the bundle goes, while settings read once before the program starts fail at its start, not in the middle of a session — the twelve-factor app.

#### Examples

```ts title="Avoid"
// src/features/orders/infrastructure/http/orders-api.adapter.ts
const ordersApiUrl = import.meta.env.VITE_ORDERS_API_URL; // built into the bundle
```

```tsx title="Prefer"
// src/main.tsx
const response = await fetch("/settings.json", { signal: AbortSignal.timeout(5_000) });
const body: unknown = await response.json();
const settings = parseAppSettings(body);

createRoot(rootElement).render(<App settings={settings} />);
```
