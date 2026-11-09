# Hooks

> Governs the hooks that call a component's effect hooks, and a binding unit.

## Vocabulary

**`hooks/`**{#reusable-hook} holds a set of reusable hooks.

A file ending in **`.hooks`**{#hooks-file} holds hooks: those that call a component's effect hooks, or a binding unit built on hooks.

## Component effects

### component-effects-in-its-hooks-file · SHOULD

No component file calls an effect hook. A component's effect hooks are called by hooks in its hooks file beside it, `<name>.hooks.ts`.

#### Why

Effect hooks called in a component file tie its markup to what they synchronise with, so the component cannot be read as its markup or rendered in a spec without them running.

#### Examples

```tsx title="Avoid"
// order-tracker.tsx
export const OrderTracker = ({ orderId }: OrderTrackerProps): ReactElement => {
  const orderFeed = useOrderFeed();
  const [status, setStatus] = useState<OrderStatus>('placed');

  useEffect(() => orderFeed.watch(orderId, setStatus), [orderFeed, orderId]);

  return <StatusBadge status={status} />;
};
```

```tsx title="Prefer"
// order-tracker.hooks.ts
export const useOrderStatus = (orderId: OrderId): OrderStatus => {
  const orderFeed = useOrderFeed();
  const [status, setStatus] = useState<OrderStatus>('placed');

  useEffect(() => orderFeed.watch(orderId, setStatus), [orderFeed, orderId]);

  return status;
};

// order-tracker.tsx
export const OrderTracker = ({ orderId }: OrderTrackerProps): ReactElement => (
  <StatusBadge status={useOrderStatus(orderId)} />
);
```

## Binding units

### binding-unit-is-a-hook → unit-handed-its-dependencies · MUST

Every operation's binding unit is a hook that takes its use case from the providers' context and calls it. Exempt: a binding unit for a caller React does not render, such as a loader or a guard.

#### Why

A binding unit that builds or imports its use case cannot be handed another in a spec, and one that is no hook cannot follow the operation's state as React renders; a hook takes the use case the composition root put in the providers' context.

#### Examples

```ts title="Avoid"
// src/features/cart/presentation/bindings/commands/add-to-cart.ts
export const createAddToCartBinding =
  (addToCart: AddToCart) =>
  (input: AddToCartForm): Promise<void> =>
    addToCart(parseAddToCartInput(input));
```

```ts title="Prefer"
// src/features/cart/presentation/bindings/commands/add-to-cart.hooks.ts
export const useAddToCart = (): ((input: AddToCartForm) => Promise<void>) => {
  const { addToCart } = use(UseCasesContext);

  return (input) => addToCart(parseAddToCartInput(input));
};
```

### plain-binding-unit-only-for-a-caller-outside-react · SHOULD

No binding unit is written as a plain `<op>.ts` before a caller outside React needs it. Such a caller is one React does not render, such as a loader or a guard.

#### Why

A plain binding unit no caller uses is a second way into the operation that nobody runs, so it drifts from the hook every screen calls and is read and kept for nothing.

#### Examples

```text title="Avoid"
features/cart/presentation/bindings/queries/
├── show-cart.ts
├── show-cart.hooks.ts
└── index.ts
```

```text title="Prefer"
features/cart/presentation/bindings/queries/
├── show-cart.hooks.ts
└── index.ts
```
