# Client

> Governs what a server sends a device program: the configuration it serves it.

## What reaches the device program

### device-program-configuration-holds-only-public-keys → device-program-holds-nothing-hidden · MUST

Every configuration a server sends a device program holds only the keys the server picks for it one by one. Each is copied by name from the server's configuration, never the configuration whole, and a type alone, erased before the run, picks none.

#### Why

A key the server's configuration gains later, a secret among them, would otherwise reach every device program without anyone choosing to send it.

#### Examples

```ts title="Avoid"
// src/presentation/bindings/queries/app-config.ts
export const serveAppConfig = (config: AppConfig): Handler => (c) =>
  c.json(config);   // a key added later, a secret among them, ships too
```

```ts title="Prefer"
// src/presentation/bindings/queries/app-config.ts
const toPublicAppConfig = (config: AppConfig): PublicAppConfig => ({
  apiBaseUrl: config.apiBaseUrl,
  checkoutPublishableKey: config.checkoutPublishableKey,
});

export const serveAppConfig = (config: AppConfig): Handler => (c) =>
  c.json(toPublicAppConfig(config));
```
