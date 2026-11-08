# Invalidation

> Governs when a write refreshes the cache.

## General

### invalidation-in-on-settled → write-invalidates-what-it-changed · MUST

Every write invalidates its keys in `onSettled`.

#### Why

`onSettled` runs after success and failure alike, so the cache is refreshed even after a write that failed on the client but landed on the server.

#### Examples

```ts title="Avoid"
return useMutation({
  mutationFn: (input: CancelOrderInput) => cancelOrder(input),
  onSuccess: (_result, input) =>
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(input.orderId) }),
});
```

```ts title="Prefer"
return useMutation({
  mutationFn: (input: CancelOrderInput) => cancelOrder(input),
  onSettled: (_result, _error, input) =>
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(input.orderId) }),
});
```
