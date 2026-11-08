# Transport

> Governs who builds the ky instances, how they reach the adapters, and the calls a saga retries itself.

## General

### one-ky-instance-per-system → one-transport-instance-per-system · MUST

Every remote system has one ky instance, built by the composition root. The root passes it to the adapters' factories; no adapter builds an instance or uses ky's default export.

#### Why

An adapter that builds its own instance speaks to the system with an address, credentials and headers of its own, which drift from the others', and a spec cannot pass another instance in its place.

#### Examples

```ts title="Avoid"
// src/features/cart/infrastructure/http/cart-api.adapter.ts
const http = ky.create({ prefixUrl: 'https://carts.shop.example' });

export const cartApi: CartApiPort = {
  find: async (cartId, context) => http.get(`carts/${cartId}`, { signal: context.signal }).json(cartSchema),
};
```

```ts title="Prefer"
// src/features/cart/infrastructure/http/cart-api.adapter.ts
export const createCartApi = (http: KyInstance): CartApiPort => ({
  find: async (cartId, context) => http.get(`carts/${cartId}`, { signal: context.signal }).json(cartSchema),
});

// src/root/cart.ts
const cartHttp = ky.create({ prefixUrl: config.cartsUrl, retry: { limit: 2, jitter: true } });
const cartApi = createCartApi(cartHttp);
```

### ky-retry-off-beneath-a-saga-step → saga-alone-retries-its-steps · MUST

Every ky call made for a saga's step or compensation sets `retry: 0`.

#### Why

Ky retries a failed call twice by default, so a call beneath a saga's step repeats under the saga's own retries and its attempts escape the saga's limit.

#### Examples

```ts title="Avoid"
export const createStockApi = (http: KyInstance): StockApiPort => ({
  reserve: async (orderId, lines, context) =>
    http.post('reservations', { json: { orderId, lines }, signal: context.signal }).json(reservationSchema), // a step of the order saga
});
```

```ts title="Prefer"
export const createStockApi = (http: KyInstance): StockApiPort => ({
  reserve: async (orderId, lines, context) =>
    http
      // Why: the order saga retries this step itself, within its own limit
      .post('reservations', { json: { orderId, lines }, retry: 0, signal: context.signal })
      .json(reservationSchema),
});
```
