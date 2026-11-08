# Domain

> Governs the domain model in TypeScript: where the rules of an aggregate, an entity and a value object live, and where an aggregate's transitions live.

## Where rules live

### entity-rules-held-by-its-companion → rule-of-one-thing-lives-beside-its-data · MUST

Every rule of one aggregate, entity or value object is a function of its companion, never a method of a class. Such rules are the thing's predicates and derived values, and a value object's operations. Exempt: an enumeration, which has no companion.

#### Why

An instance of a class loses its methods when it crosses a cache, storage, a worker or a message, which carry plain data as it is, and a rule kept apart from its type's name is looked for in every file that uses the type.

#### Examples

```ts title="Avoid"
// src/features/orders/domain/order/entities/order.aggregate.ts
export class Order {
  constructor(
    readonly id: OrderId,
    readonly status: OrderStatus,
    readonly lines: readonly OrderLine[],
  ) {}

  isCancellable(): boolean {
    return this.status === OrderStatus.Placed;
  }
}
```

```ts title="Prefer"
// src/features/orders/domain/order/entities/order.aggregate.ts
export type Order = {
  readonly id: OrderId;
  readonly status: OrderStatus;
  readonly lines: readonly OrderLine[];
};

export const Order = {
  isCancellable: (order: Order): boolean => order.status === OrderStatus.Placed,
};
```

### companion-function-takes-its-thing-first → rule-of-one-thing-lives-beside-its-data · SHOULD

Every rule a companion holds for its aggregate, entity or value object takes that thing as its first parameter. Such rules are the thing's predicates and derived values, and a value object's operations.

#### Why

A function that takes its thing in another place reads differently at each call, so its reader looks up each signature of the companion before calling it, and a call that hands two values of one type in the wrong order still compiles.

#### Examples

```ts title="Avoid"
export const Cart = {
  quantityOf: (sku: Sku, cart: Cart): number =>
    cart.lines.find((line) => line.sku === sku)?.quantity ?? 0,
};
```

```ts title="Prefer"
export const Cart = {
  quantityOf: (cart: Cart, sku: Sku): number =>
    cart.lines.find((line) => line.sku === sku)?.quantity ?? 0,
};
```

## Construction

### aggregate-never-built-by-a-literal-spread-or-clone → aggregate-changed-only-by-its-transitions · MUST

No code outside an aggregate's transitions and its rebuild from storage writes an object literal, a spread or a `structuredClone` of it. This holds for its inner entities too, in specs as in production.

#### Why

The compiler accepts any object of the right shape as the aggregate, so only these functions keep a state nothing checked from existing.

#### Examples

```ts title="Avoid"
// src/features/orders/application/use-cases/commands/refund-order.use-case.test.ts
const order: Order = { id: orderId, status: OrderStatus.Paid, lines: [line] };
const orderRepository = new OrderRepositoryFake([order]);
```

```ts title="Prefer"
// src/features/orders/application/use-cases/commands/refund-order.use-case.test.ts
const order = pay(place({ orderId, lines: [line] }), { paidAt });
const orderRepository = new OrderRepositoryFake([order]);
```

### aggregate-transition-kept-off-its-companion → surface-offers-operations-not-mechanisms · MUST

Every aggregate transition is a free function of its concept's `transitions/`, never a member of its aggregate's companion.

#### Why

The companion goes onto the feature's surface with the aggregate's predicates and derived values, so a transition it holds goes there too, and a presentation or an adapter that imports the companion can change the aggregate.

#### Examples

```ts title="Avoid"
// src/features/orders/domain/order/entities/order.aggregate.ts
export const Order = {
  isCancellable: (order: Order): boolean => order.status === OrderStatus.Placed,
  /** @throws {OrderNotCancellableError} when the order is past placing */
  cancel: (order: Order): Order => {
    if (!Order.isCancellable(order)) {
      throw new OrderNotCancellableError(order.id);
    }
    return { ...order, status: OrderStatus.Cancelled };
  },
};
```

```ts title="Prefer"
// src/features/orders/domain/order/entities/order.aggregate.ts
export const Order = {
  isCancellable: (order: Order): boolean => order.status === OrderStatus.Placed,
};

// src/features/orders/domain/order/transitions/order.transitions.ts
/** @throws {OrderNotCancellableError} when the order is past placing */
export const cancel = (order: Order): Order => {
  if (!Order.isCancellable(order)) {
    throw new OrderNotCancellableError(order.id);
  }
  return { ...order, status: OrderStatus.Cancelled };
};
```
