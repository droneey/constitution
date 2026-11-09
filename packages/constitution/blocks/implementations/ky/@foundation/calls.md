# Calls

> Governs a call: its timeout, its signal, its retries and the fake a spec gives it.

## General

### ky-timeout-kept → outside-call-has-a-timeout · MUST

Every ky call keeps its `timeout` on.

#### Why

Without the timeout a call waits for as long as the server keeps the connection open.

#### Examples

```ts title="Avoid"
// src/features/reports/infrastructure/http/report-api.adapter.ts
export const createReportApi = (http: KyInstance): ReportApiPort => ({
  export: async (month, context) =>
    http.post('exports', { json: { month }, timeout: false, signal: context.signal }).json(exportSchema),
});
```

```ts title="Prefer"
// src/features/reports/infrastructure/http/report-api.adapter.ts
export const createReportApi = (http: KyInstance): ReportApiPort => ({
  export: async (month, context) =>
    http.post('exports', { json: { month }, timeout: 60_000, signal: context.signal }).json(exportSchema),
});
```

### ky-signal-kept → outside-call-can-be-cancelled · SHOULD

Every ky call is given its caller's abort signal as `signal`.

#### Why

Without the signal a call runs on for a caller who left.

#### Examples

```ts title="Avoid"
export const createCartApi = (http: KyInstance): CartApiPort => ({
  find: async (cartId) => http.get(`carts/${cartId}`).json(cartSchema),
});
```

```ts title="Prefer"
export const createCartApi = (http: KyInstance): CartApiPort => ({
  find: async (cartId, context) => http.get(`carts/${cartId}`, { signal: context.signal }).json(cartSchema),
});
```

### ky-retries-kept-to-transient-failures → failure-retried-only-when-transient · MUST

Every ky instance retries only transient failures. Its `retry` stays on idempotent methods and transient statuses, and no option, such as `methods`, `statusCodes`, `retryOnTimeout` or `shouldRetry`, adds a method that is not idempotent or a failure that is not transient.

#### Why

Ky's defaults already retry only what may succeed the next time, so an option that widens them repeats a side effect or waits on a failure that will not change, and does so in silence.

#### Examples

```ts title="Avoid"
// src/root/http.ts
export const createPaymentsHttp = (config: Config): KyInstance =>
  ky.create({
    prefixUrl: config.paymentsUrl,
    retry: { limit: 2, methods: ['get', 'post'], statusCodes: [400, 500, 502, 503], jitter: true },
  });
```

```ts title="Prefer"
// src/root/http.ts
export const createPaymentsHttp = (config: Config): KyInstance =>
  ky.create({
    prefixUrl: config.paymentsUrl,
    retry: { limit: 2, jitter: true },
  });
```

### ky-retry-jitter-on → retry-waits-by-backoff-or-the-asked-delay · MUST

Every ky instance that retries sets `retry.jitter`, so its backoff is spread at random.

#### Why

Ky's backoff has no random spread unless `jitter` is set (ky's readme), so the clients a failure hit retry all together and keep the server down.

#### Examples

```ts title="Avoid"
// src/root/http.ts
export const createCatalogueHttp = (config: Config): KyInstance =>
  ky.create({ prefixUrl: config.catalogueUrl, retry: { limit: 3 } });
```

```ts title="Prefer"
// src/root/http.ts
export const createCatalogueHttp = (config: Config): KyInstance =>
  ky.create({ prefixUrl: config.catalogueUrl, retry: { limit: 3, jitter: true } });
```

### ky-spec-fetch-refuses-unmatched → unmatched-request-fails-the-spec · MUST

A spec fakes ky through its `fetch` option, which refuses every request the case does not expect. The function it passes answers the requests the case expects and throws on any other, naming its method and URL; no spec replaces the global `fetch`.

#### Why

A fake that answers any request lets a wrong call pass, and a replaced global `fetch` reaches every other call of the spec's process; the `fetch` option is the seam ky offers for a fake.

#### Examples

```ts title="Avoid"
globalThis.fetch = async () => Response.json({ id: 'cart-1', lines: [] });

const cartApi = createCartApi(ky.create({ prefixUrl: 'https://carts.test' }));
```

```ts title="Prefer"
const fakeFetch = async (request: Request): Promise<Response> => {
  if (request.method === 'GET' && request.url === 'https://carts.test/carts/cart-1') {
    return Response.json({ id: 'cart-1', lines: [] });
  }
  throw new UnexpectedRequestError(request.method, request.url);
};

const cartApi = createCartApi(ky.create({ prefixUrl: 'https://carts.test', fetch: fakeFetch }));
```
