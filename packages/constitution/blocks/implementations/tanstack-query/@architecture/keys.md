# Keys

> Governs the cache's key factory and the declaration of each read.

## General

### key-factory-kept-in-the-shared-bindings → cache-key-built-by-its-owners-factory · MUST

Every feature's key factory, and each composition module's, lives in `cache.ts`, in the `shared/` of its presentation's `bindings/`.

#### Why

A key factory kept beside one binding unit is copied by the next one that needs its keys, and the two copies drift, so an invalidation misses the read it should refresh.

#### Examples

```text title="Avoid"
features/orders/presentation/bindings/
├── queries/
│   ├── order-keys.ts
│   ├── show-order.hooks.ts
│   └── index.ts
└── index.ts
```

```text title="Prefer"
features/orders/presentation/bindings/
├── queries/
│   ├── show-order.hooks.ts
│   └── index.ts
├── shared/
│   ├── cache.ts
│   └── index.ts
└── index.ts
```

### read-declared-once-as-query-options → fact-has-one-source · MUST

Each read is declared once, as `queryOptions` that take its use case as input, beside its key factory. Every caller of the read uses them, and a `queryFn` is written only inside them.

#### Why

A read declared twice runs with different options in the hook and in the loader, and a `queryFn` written elsewhere is such a second declaration — a single source of truth.

#### Examples

```ts title="Avoid"
// show-order.hooks.ts
export const useOrder = (orderId: OrderId): UseQueryResult<Order> => {
  const { getOrder } = use(UseCasesContext);

  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => getOrder({ orderId }, { signal }),
  });
};
```

```ts title="Prefer"
// shared/cache.ts
export const orderQueryOptions = (getOrder: GetOrder, orderId: OrderId) =>
  queryOptions({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => getOrder({ orderId }, { signal }),
  });

// queries/show-order.hooks.ts
export const useOrder = (orderId: OrderId): UseQueryResult<Order> => {
  const { getOrder } = use(UseCasesContext);

  return useQuery(orderQueryOptions(getOrder, orderId));
};
```
