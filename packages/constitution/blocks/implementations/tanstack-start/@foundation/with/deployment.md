# Deployment

> Governs how the tab takes its configuration where Start's server serves the program.

## General

### runtime-config-from-one-server-function → served-configuration-read-at-boot · MUST

Wherever Start's server serves the program, one server function serves the public part of the configuration read at its start. The root route loads it once, before anything reads configuration.

#### Why

Configuration built into the bundle needs a build for each environment, and a setting first read in use fails there instead of at start.

#### Examples

```ts title="Avoid"
// src/features/checkout/infrastructure/http/payment-gateway.adapter.ts
const paymentsUrl = import.meta.env.VITE_PAYMENTS_URL;
```

```ts title="Prefer"
// src/root/public-config.ts
export const getPublicConfig = createServerFn({ method: 'GET' }).handler(
  (): PublicConfig => ({ apiUrl: config.apiUrl, paymentsUrl: config.paymentsUrl }),
);

// src/root/routes/__root.tsx
export const Route = createRootRouteWithContext<RouterContext>()({
  loader: () => getPublicConfig(),
  shellComponent: RootDocument,
});
```
