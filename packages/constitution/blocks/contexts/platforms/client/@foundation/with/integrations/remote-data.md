# Remote data

> Governs remote data on a device that may go offline: what a device program serves from its cache, and what becomes of a write it takes offline.

## Cache

### cached-remote-data-served-offline · SHOULD

Every piece of remote data a device program has cached is served while the device is offline, even after the program restarts.

#### Why

A device goes offline often, on a train, underground or where the signal drops, and a program that is useless without the network fails its user each time.

#### Examples

```tsx title="Avoid"
const queryClient = new QueryClient(); // the cache dies with the process

export const App = (): ReactElement => (
  <QueryClientProvider client={queryClient}>
    <OrdersScreen />
  </QueryClientProvider>
);
```

```tsx title="Prefer"
const queryClient = new QueryClient({
  // Why: a query dropped from memory is dropped from the persisted cache too
  defaultOptions: { queries: { gcTime: 24 * 60 * 60 * 1000 } },
});
const persister = createAsyncStoragePersister({ storage: AsyncStorage });

export const App = (): ReactElement => (
  <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
    <OrdersScreen />
  </PersistQueryClientProvider>
);
```

### offline-remote-data-carries-its-fetch-time · SHOULD

Every piece of remote data a device program serves offline shows its user the time it was fetched.

#### Why

A value served from the cache looks as fresh as one just fetched, and a user who cannot tell its age acts on data that changed long ago.

#### Examples

```tsx title="Avoid"
export const OrdersScreen = (): ReactElement => {
  const { data: orders = [] } = useQuery(ordersQuery);

  return <OrderList orders={orders} />; // as fresh-looking offline as online
};
```

```tsx title="Prefer"
export const OrdersScreen = (): ReactElement => {
  const { data: orders = [], dataUpdatedAt } = useQuery(ordersQuery);
  const online = useOnline();

  return (
    <>
      {!online && <FetchedAt at={Temporal.Instant.fromEpochMilliseconds(dataUpdatedAt)} />}
      <OrderList orders={orders} />
    </>
  );
};
```

## Writes

### offline-write-queued-or-refused · MUST

Every write a device program takes while offline is queued or refused, never dropped silently. It is queued durably and sent when the network returns, or refused at once with its reason.

#### Why

A write the user believes made and the program quietly lost is data lost without anyone knowing to make it again.

#### Examples

```ts title="Avoid"
export const addToCart = async (line: CartLine, context: Context): Promise<void> => {
  if (!network.isOnline()) {
    return; // the line is lost without a word
  }
  await cartApi.addLine(line, context);
};
```

```ts title="Prefer"
export const addToCart = async (line: CartLine, context: Context): Promise<void> => {
  if (!network.isOnline()) {
    await outbox.enqueue(PendingWrite.AddCartLine, line, context);
    return;
  }
  await cartApi.addLine(line, context);
};
```
