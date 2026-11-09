# Data

> Governs where a TypeScript aggregate's rebuild from storage lives.

## Rebuild

### aggregate-rebuild-kept-off-its-companion → rebuild-from-storage-called-only-by-its-adapters · MUST

Every aggregate's rebuild from storage is a free function its root's file exports beside the type, never a member of its companion.

#### Why

The companion goes onto the feature's surface with the aggregate's predicates and derived values, so a rebuild it holds goes there too, and a use case that reaches it builds an aggregate its starting transition never checked.

#### Examples

```ts title="Avoid"
// src/features/orders/domain/order/entities/order.aggregate.ts
export const Order = {
  isCancellable: (order: Order): boolean => order.status === OrderStatus.Placed,
  /** @throws {CorruptOrderError} when the stored order has no lines */
  restore: (stored: StoredOrder): Order => {
    if (stored.lines.length === 0) {
      throw new CorruptOrderError(stored.id);
    }
    return { id: stored.id, status: stored.status, lines: stored.lines };
  },
};
```

```ts title="Prefer"
// src/features/orders/domain/order/entities/order.aggregate.ts
export const Order = {
  isCancellable: (order: Order): boolean => order.status === OrderStatus.Placed,
};

/** @throws {CorruptOrderError} when the stored order has no lines */
export const restoreOrder = (stored: StoredOrder): Order => {
  if (stored.lines.length === 0) {
    throw new CorruptOrderError(stored.id);
  }
  return { id: stored.id, status: stored.status, lines: stored.lines };
};
```
