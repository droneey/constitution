# State and effects

> Governs a component's effects and its state.

## Vocabulary

An **external store** is state kept outside React that a component subscribes to, such as a state library or a browser API; it keeps nothing beyond a run, unlike a store of the program's data.

## Effects

### effects-only-for-external-systems · MUST

Every effect only synchronises with a system outside React. It never answers an event, whose response sits in that event's handler.

#### Why

An effect that answers an event runs again whenever its dependencies change, so the response repeats or fires where no event took place, while a handler runs once for the event it answers.

#### Examples

```tsx title="Avoid"
const [isSubmitted, setIsSubmitted] = useState(false);

useEffect(() => {
  if (isSubmitted) {
    showToast(t`Order placed`);
  }
}, [isSubmitted]);

const onSubmit = (): void => setIsSubmitted(true);
```

```tsx title="Prefer"
const onSubmit = (): void => {
  showToast(t`Order placed`);
};
```

### derived-value-computed-during-render → fact-has-one-source · MUST

Every value React can derive from props, state or context is computed during render, never kept in state. No effect sets state from other state.

#### Why

A derived copy kept in state by an effect renders twice, races and is one render behind the value it copies.

#### Examples

```tsx title="Avoid"
const [lines, setLines] = useState<readonly CartLine[]>([]);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(sumLines(lines));
}, [lines]);
```

```tsx title="Prefer"
const [lines, setLines] = useState<readonly CartLine[]>([]);
const total = sumLines(lines);
```

### external-store-read-by-use-sync-external-store · MUST

Every external store a component reads is read through `useSyncExternalStore`, never copied into state by an effect.

#### Why

A store copied by an effect shows its old value for a render, and concurrent rendering can show two of its values on one screen.

#### Examples

```ts title="Avoid"
export const useIsOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const update = (): void => setIsOnline(navigator.onLine);

    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return isOnline;
};
```

```ts title="Prefer"
const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);

  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

export const useIsOnline = (): boolean => useSyncExternalStore(subscribe, () => navigator.onLine);
```

### non-reactive-logic-in-an-effect-event · MUST

Every function an effect calls that changes between renders without being a reason to re-run the effect is wrapped in `useEffectEvent`.

#### Why

A function listed among an effect's dependencies re-runs it each time the function changes, and one left out of them reads the values of the render that started the effect.

#### Examples

```ts title="Avoid"
export const useOrderUpdates = ({ orderFeed, orderId, onUpdate }: OrderUpdatesOptions): void => {
  useEffect(() => {
    const subscription = orderFeed.subscribe(orderId, onUpdate);

    return () => subscription.close();
  }, [orderFeed, orderId, onUpdate]);
};
```

```ts title="Prefer"
export const useOrderUpdates = ({ orderFeed, orderId, onUpdate }: OrderUpdatesOptions): void => {
  const onOrder = useEffectEvent(onUpdate);

  useEffect(() => {
    const subscription = orderFeed.subscribe(orderId, onOrder);

    return () => subscription.close();
  }, [orderFeed, orderId]);
};
```

### effect-releases-in-its-cleanup → resource-released-on-every-path · MUST

Every effect's cleanup releases what the effect holds. That is its subscriptions, listeners, sockets and timers.

#### Why

An effect that does not clean up leaks what it holds each time it runs again or its component unmounts.

#### Examples

```ts title="Avoid"
export const useCartSync = (cartSocket: CartSocket, onCart: (cart: Cart) => void): void => {
  useEffect(() => {
    cartSocket.addEventListener('message', onCart);
  }, [cartSocket, onCart]);
};
```

```ts title="Prefer"
export const useCartSync = (cartSocket: CartSocket, onCart: (cart: Cart) => void): void => {
  useEffect(() => {
    cartSocket.addEventListener('message', onCart);

    return () => cartSocket.removeEventListener('message', onCart);
  }, [cartSocket, onCart]);
};
```

### effect-aborts-its-calls-on-cleanup → outside-call-can-be-cancelled · MUST

Every effect's cleanup aborts the calls the effect started, so only the latest response lands.

#### Why

A call left running past its cleanup answers late, and its response overwrites the newer one the effect asked for next.

#### Examples

```ts title="Avoid"
useEffect(() => {
  void searchProducts({ query }).then(setResults);
}, [query, searchProducts]);
```

```ts title="Prefer"
useEffect(() => {
  const controller = new AbortController();

  void searchProducts({ query }, { signal: controller.signal }).then(setResults, ignoreAbort);

  return () => controller.abort();
}, [query, searchProducts]);
```

## State

### async-ui-state-through-actions · SHOULD

All asynchronous state of the interface goes through React's actions. The state of work in flight, an optimistic value and a transition go through `useActionState`, `useOptimistic` and `useTransition`. Exempt: state an external store holds or tracks, such as a cache of server data.

#### Why

The state of work in flight kept by hand is unknown to React, which then cannot keep the interface responsive while it waits, and a flag set by hand drifts from the work it tracks.

#### Examples

```tsx title="Avoid"
const [isPending, setIsPending] = useState(false);

const onSubmit = async (formData: FormData): Promise<void> => {
  setIsPending(true);
  await placeOrder(parsePlaceOrderForm(formData));
  setIsPending(false);
};
```

```tsx title="Prefer"
const [isPending, startTransition] = useTransition();

const onSubmit = (formData: FormData): void => {
  startTransition(async () => {
    await placeOrder(parsePlaceOrderForm(formData));
  });
};
```

### fast-source-batched-in-its-hook → fast-source-updates-once-per-frame · SHOULD

Every hook that folds a fast source sets its state at most once per animation frame.

#### Why

A render per event starves the frame, and the screen stops answering while the source runs.

#### Examples

```ts title="Avoid"
export const usePointer = (): Point => {
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent): void => setPoint({ x: event.clientX, y: event.clientY });

    window.addEventListener('pointermove', onMove);

    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return point;
};
```

```ts title="Prefer"
export const usePointer = (): Point => {
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;
    const onMove = (event: PointerEvent): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setPoint({ x: event.clientX, y: event.clientY }));
    };

    window.addEventListener('pointermove', onMove);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return point;
};
```

### expensive-render-reads-input-through-use-deferred-value → long-work-never-blocks-input · SHOULD

Every expensive render that input drives reads that input through `useDeferredValue`.

#### Why

An expensive render run on every keystroke holds the input still, so what the person types lags behind their keys.

#### Examples

```tsx title="Avoid"
export const ProductSearch = ({ products }: ProductSearchProps): ReactElement => {
  const [query, setQuery] = useState('');

  return (
    <>
      <SearchField value={query} onValueChange={setQuery} />
      <ProductGrid products={filterProducts(products, query)} />
    </>
  );
};
```

```tsx title="Prefer"
export const ProductSearch = ({ products }: ProductSearchProps): ReactElement => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <SearchField value={query} onValueChange={setQuery} />
      <ProductGrid products={filterProducts(products, deferredQuery)} />
    </>
  );
};
```
