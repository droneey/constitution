# Search

> Governs a route's parameters: parsed, defaulted and declared by a loader.

## General

### route-parameters-parsed-by-schema → address-parsed-as-untrusted-input · MUST

Every route's search and path parameters are parsed by a schema. The search is parsed in the route's `validateSearch`, and the path in its `params.parse`.

#### Why

The URL is input anyone can type, so an unparsed parameter reaches the screen as whatever was typed — parse, don't validate.

#### Examples

```tsx title="Avoid"
// src/root/routes/orders/$orderId.tsx
export const Route = createFileRoute('/orders/$orderId')({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      orderQueryOptions(context.useCases.getOrder, params.orderId as OrderId),
    ),
});
```

```tsx title="Prefer"
// src/root/routes/orders/$orderId.tsx
export const Route = createFileRoute('/orders/$orderId')({
  params: { parse: (params) => orderParamsSchema.parse(params) },
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(
      orderQueryOptions(context.useCases.getOrder, params.orderId),
    ),
});
```

### search-falls-back-to-defaults → unparsable-address-opens-a-fallback · MUST

Every route whose search fails its schema opens with all of its search defaults, never with the parameters that did parse.

#### Why

A search filled from the parameters that parsed beside defaults for the rest is a state no link asked for, while one that fails as a whole opens the screen as a fresh visit would.

#### Examples

```ts title="Avoid"
const ordersSearchSchema = z.strictObject({
  page: z.int().positive().catch(1),
  status: z.enum(OrderStatus).catch('open'),
});

export const Route = createFileRoute('/orders/')({ validateSearch: ordersSearchSchema });
```

```ts title="Prefer"
const ordersSearchDefaults: OrdersSearch = { page: 1, status: 'open' };

export const Route = createFileRoute('/orders/')({
  validateSearch: (search): OrdersSearch => {
    const result = ordersSearchSchema.safeParse(search);

    return result.success ? result.data : ordersSearchDefaults;
  },
});
```

### loader-declares-the-search-it-reads · MUST

Every loader that reads search params declares them in `loaderDeps`.

#### Why

A loader that reads search params it does not declare keeps the data of the old ones when they change, and its cache entry serves one set's data for another.

#### Examples

```ts title="Avoid"
export const Route = createFileRoute('/orders/')({
  validateSearch: parseOrdersSearch,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      ordersQueryOptions(context.useCases.listOrders, parseOrdersSearch(location.search)),
    ),
});
```

```ts title="Prefer"
export const Route = createFileRoute('/orders/')({
  validateSearch: parseOrdersSearch,
  loaderDeps: ({ search: { page, status } }) => ({ page, status }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions(context.useCases.listOrders, deps)),
});
```
