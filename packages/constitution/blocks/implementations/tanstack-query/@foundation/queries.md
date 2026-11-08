# Queries

> Governs a read through the cache: its result, its error type, the key of an input, its abort signal and its retries.

## General

### query-result-returned-as-status-union → data-call-returns-a-union-of-its-states · MUST

Every wrapper of a query or a mutation returns Query's own result, a union keyed by its `status`. Exempt: a wrapper that suspends the read with `useSuspenseQuery`, which leaves its waiting and failed states to the boundary above it.

#### Why

A result spread into flags lets a consumer meet combinations no state has and mistake "not loaded" for "empty" — make illegal states unrepresentable.

#### Examples

```ts title="Avoid"
export const useOrder = (orderId: OrderId): { order?: Order; isLoading: boolean } => {
  const { getOrder } = use(UseCasesContext);
  const { data, isPending } = useQuery(orderQueryOptions(getOrder, orderId));

  return { order: data, isLoading: isPending };
};
```

```ts title="Prefer"
export const useOrder = (orderId: OrderId): UseQueryResult<Order> => {
  const { getOrder } = use(UseCasesContext);

  return useQuery(orderQueryOptions(getOrder, orderId));
};
```

### query-error-type-registered-once → fact-has-one-source · MUST

The cache's error type is registered once, as `defaultError` of Query's `Register` interface. No read declares an error type of its own.

#### Why

An error type declared at each read drifts from what the cache's one failure handler receives, so a consumer branches on a type its error never has.

#### Examples

```ts title="Avoid"
export const useOrder = (orderId: OrderId): UseQueryResult<Order, OrderNotFoundError | NetworkError> => {
  const { getOrder } = use(UseCasesContext);

  return useQuery<Order, OrderNotFoundError | NetworkError>(orderQueryOptions(getOrder, orderId));
};
```

```ts title="Prefer"
// src/root/query-client.ts
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}
```

## Inputs

### input-query-keyed-on-debounced-value → input-driven-requests-debounced · SHOULD

Every query driven by typing is keyed on the debounced value.

#### Why

A query per keystroke floods the server.

#### Examples

```ts title="Avoid"
export const useProductSearch = (query: string): UseQueryResult<readonly Product[]> => {
  const { searchProducts } = use(UseCasesContext);

  return useQuery(productSearchQueryOptions(searchProducts, query));
};
```

```ts title="Prefer"
export const useProductSearch = (query: string): UseQueryResult<readonly Product[]> => {
  const { searchProducts } = use(UseCasesContext);
  const debouncedQuery = useDebouncedValue(query, searchDebounceMs);

  return useQuery(productSearchQueryOptions(searchProducts, debouncedQuery));
};
```

### input-query-keeps-its-previous-result → loading-never-replaces-shown-content · SHOULD

Every query driven by typing keeps its previous result as its placeholder, by `placeholderData: keepPreviousData`.

#### Why

A blank list between keystrokes flickers, and the user loses the results they were reading.

#### Examples

```ts title="Avoid"
export const productSearchQueryOptions = (searchProducts: SearchProducts, query: string) =>
  queryOptions({
    queryKey: productKeys.search(query),
    queryFn: ({ signal }) => searchProducts({ query }, { signal }),
  });
```

```ts title="Prefer"
export const productSearchQueryOptions = (searchProducts: SearchProducts, query: string) =>
  queryOptions({
    queryKey: productKeys.search(query),
    queryFn: ({ signal }) => searchProducts({ query }, { signal }),
    placeholderData: keepPreviousData,
  });
```

## Cancellation and retries

### query-signal-reaches-the-request → outside-call-can-be-cancelled · SHOULD

Every `queryFn` passes Query's abort signal to the operation it calls, down to the request. A screen that is left so cancels its read.

#### Why

A read nobody waits for any more still costs the network and the server, and its answer reaches nobody.

#### Examples

```ts title="Avoid"
export const orderQueryOptions = (getOrder: GetOrder, orderId: OrderId) =>
  queryOptions({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder({ orderId }),
  });
```

```ts title="Prefer"
export const orderQueryOptions = (getOrder: GetOrder, orderId: OrderId) =>
  queryOptions({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => getOrder({ orderId }, { signal }),
  });
```

### query-retry-only-transient → failure-retried-only-when-transient · MUST

Every query, and every mutation that is idempotent, retries only transient failures, within a limit; no other mutation retries. The client's `retry` is a predicate on the error's transience with a limit, or `false` where the transport retries, never the default three retries on every error.

#### Why

A retry of a failure that will not change delays the error the user needs to see, and a retry of a write that is not idempotent repeats its effect.

#### Examples

```ts title="Avoid"
export const createQueryClient = (): QueryClient => new QueryClient();
```

```ts title="Prefer"
const maxRetries = 3;

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => failureCount < maxRetries && isTransient(error),
        retryDelay: jitteredBackoff,
      },
      mutations: { retry: false },
    },
  });
```

### query-retry-off-where-the-transport-retries → failure-retried-at-one-level · MUST

Every client whose remote transport already retries sets Query's `retry` to `false`.

#### Why

A second level of retries over the transport's multiplies its attempts, keeping a struggling system down.

#### Examples

```ts title="Avoid"
const http = ky.create({ prefixUrl: config.apiUrl, retry: { limit: 3 } });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: (failureCount, error) => failureCount < 3 && isTransient(error) },
  },
});
```

```ts title="Prefer"
const http = ky.create({ prefixUrl: config.apiUrl, retry: { limit: 3 } });

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
```

### query-retry-delay-spread-at-random → retry-waits-by-backoff-or-the-asked-delay · MUST

Every client that retries sets a `retryDelay` that spreads Query's exponential backoff at random.

#### Why

Query's default delay doubles from one second up to thirty with no random spread (TanStack Query, retries guide), so the clients a failure hit retry all together and keep the server down.

#### Examples

```ts title="Avoid"
retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
```

```ts title="Prefer"
retryDelay: (attempt) => Math.random() * Math.min(baseDelayMs * 2 ** attempt, maxDelayMs),
```
