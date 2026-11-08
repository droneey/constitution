# Mutations

> Governs a write through the cache: when it ends, and an optimistic write's rollback, the reads it cancels and the items it shows.

## General

### write-in-flight-until-its-refresh-lands · SHOULD

Every write's `onSettled` returns the promise of the invalidation it starts, so the write stays in flight until the fresh data lands.

#### Why

A write that ends before its refresh shows the old data for a moment, as if it had failed, and an item rendered from the write's variables disappears until the refresh brings it back.

#### Examples

```ts title="Avoid"
return useMutation({
  mutationFn: (input: CancelOrderInput) => cancelOrder(input),
  onSettled: (_result, _error, input) => {
    void queryClient.invalidateQueries({ queryKey: orderKeys.detail(input.orderId) });
  },
});
```

```ts title="Prefer"
return useMutation({
  mutationFn: (input: CancelOrderInput) => cancelOrder(input),
  onSettled: (_result, _error, input) =>
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(input.orderId) }),
});
```

### optimism-in-the-mutation-lifecycle → overlapping-writes-keep-each-others-results · MUST

Every optimistic write that predicts into the cache keeps its optimism in the mutation's lifecycle. `onMutate` takes the snapshot and writes the prediction, and `onError` restores the snapshot and reapplies the mutations still in flight on the key; no step of it runs inside `mutationFn`.

#### Why

This is the order that survives concurrent writes: a rollback that skips the reapply loses another write's change, and a prediction written inside `mutationFn` is never rolled back.

#### Examples

```ts title="Avoid"
return useMutation({
  mutationFn: async (input: RenameCartInput) => {
    const cartKey = cartKeys.detail(input.cartId);
    const previous = queryClient.getQueryData(cartKey);

    queryClient.setQueryData(cartKey, (cart) => cart && renameLocally(cart, input.name));

    try {
      return await renameCart(input);
    } catch (error) {
      queryClient.setQueryData(cartKey, previous);
      throw error;
    }
  },
});
```

```ts title="Prefer"
return useMutation({
  mutationFn: (input: RenameCartInput) => renameCart(input),
  onMutate: async (input) => {
    const cartKey = cartKeys.detail(input.cartId);

    await queryClient.cancelQueries({ queryKey: cartKey });

    const previous = queryClient.getQueryData(cartKey);

    queryClient.setQueryData(cartKey, (cart) => cart && renameLocally(cart, input.name));

    return { previous };
  },
  onError: (_error, input, context) => {
    queryClient.setQueryData(
      cartKeys.detail(input.cartId),
      reapplyPendingRenames(queryClient, context?.previous),
    );
  },
  onSettled: (_result, _error, input) =>
    queryClient.invalidateQueries({ queryKey: cartKeys.detail(input.cartId) }),
});
```

### in-flight-reads-cancelled-by-on-mutate → in-flight-read-never-overwrites-a-pending-change · MUST

Every optimistic write that predicts into the cache cancels the key's reads in flight by `cancelQueries` in `onMutate`, before writing its prediction.

#### Why

A read already in flight lands after the prediction and writes the server's older data over it, so the change the user made vanishes from the screen.

#### Examples

```ts title="Avoid"
onMutate: (input) => {
  const previous = queryClient.getQueryData(cartKeys.detail(input.cartId));

  queryClient.setQueryData(cartKeys.detail(input.cartId), (cart) =>
    cart && renameLocally(cart, input.name),
  );

  return { previous };
},
```

```ts title="Prefer"
onMutate: async (input) => {
  await queryClient.cancelQueries({ queryKey: cartKeys.detail(input.cartId) });

  const previous = queryClient.getQueryData(cartKeys.detail(input.cartId));

  queryClient.setQueryData(cartKeys.detail(input.cartId), (cart) =>
    cart && renameLocally(cart, input.name),
  );

  return { previous };
},
```

### assigned-identifier-item-rendered-from-the-variables → pending-item-keeps-its-place · MUST

Every item whose identifier the server assigns renders from the mutation's variables until the write ends, never from a cache write.

#### Why

A prediction written into the cache needs an identifier the server has not given, so the refresh after the write shows the item twice or moves it, as if it were a new one.

#### Examples

```tsx title="Avoid"
onMutate: (input: AddReviewInput) => {
  queryClient.setQueryData(reviewKeys.list(input.productId), (reviews = []) => [
    ...reviews,
    { id: crypto.randomUUID(), text: input.text },
  ]);
},
```

```tsx title="Prefer"
export const ReviewList = ({ reviews }: ReviewListProps): ReactElement => {
  const addReview = useAddReview();

  return (
    <ul>
      {reviews.map((review) => (
        <ReviewItem key={review.id} text={review.text} />
      ))}
      {addReview.isPending && <ReviewItem text={addReview.variables.text} isPending />}
    </ul>
  );
};
```
