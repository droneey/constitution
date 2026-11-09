# Route tree

> Governs where routes are registered, what a route file holds, how services reach loaders, where the router is imported, and who declares a route's document metadata.

## General

### routes-registered-in-the-root → delivery-unit-registered-by-the-root · MUST

Every route is a file route under `root/routes/`. The router generates its tree from them into `root/`, and `root/router.ts`, or `root/router.tsx` where it writes markup, creates the router.

#### Why

A route registered elsewhere is not found by a reader who looks for a URL's screen in the root's file tree, and the root no longer lists everything the program answers.

#### Examples

```text title="Avoid"
src/
├── features/orders/presentation/routes/
│   └── orders.tsx
├── routes/
│   └── __root.tsx
├── routeTree.gen.ts
└── router.ts
```

```text title="Prefer"
src/
├── presentation/screens/orders-screen/
│   └── orders-screen.tsx
└── root/
    ├── routes/
    │   ├── __root.tsx
    │   └── orders.tsx
    ├── routeTree.gen.ts
    └── router.ts
```

### route-file-holds-only-what-the-router-asks → fixed-registration-holds-only-the-handoff · SHOULD

Every route file holds only what the router asks of it. It registers one screen of the program's presentation: it holds the screen's address and its schema, takes its pending and error components from the surface of the screen's module, leaves what its loader and guard decide to binding units, and hands the screen its parameters, links, navigations and its error component's retry; a layout route hands its screen `<Outlet/>` as a slot.

#### Why

A decision kept in a route file sits in the root, which no spec proves, and a screen that reaches the router itself renders only inside it; a route that only registers needs no spec, and what the router renders around the screen is proven with the screen's module — Humble Object.

#### Examples

```tsx title="Avoid"
// src/root/routes/orders/$orderId.tsx
const OrderRoute = (): ReactElement => {
  const { orderId } = Route.useParams();
  const { data: order } = useSuspenseQuery(orderQueryOptions(useUseCases().getOrder, orderId));

  return <h1>{order.status === 'shipped' ? t`Shipped` : order.number}</h1>;
};
```

```tsx title="Prefer"
// src/root/routes/orders/$orderId.tsx
import { OrderScreen, OrderScreenPending } from '../../../presentation';

const OrderRoute = (): ReactElement => {
  const { orderId } = Route.useParams();

  return <OrderScreen orderId={orderId} />;
};

export const Route = createFileRoute('/orders/$orderId')({
  params: { parse: parseOrderParams },
  component: OrderRoute,
  pendingComponent: OrderScreenPending,
  errorComponent: OrderRouteFailure,
});
```

### services-reach-loaders-through-router-context → unit-handed-its-dependencies · MUST

Every service the providers build reaches loaders and guards through the router's context. Such services include the use cases and the configuration.

#### Why

A loader that imports a service reaches another instance than the screens use, and a spec cannot replace it without patching the import; through the context, one place hands every service to both.

#### Examples

```tsx title="Avoid"
import { useCases } from '../../use-cases';

export const Route = createFileRoute('/orders/')({
  loader: () => queryClient.ensureQueryData(ordersQueryOptions(useCases.listOrders)),
});
```

```tsx title="Prefer"
export const Route = createFileRoute('/orders/')({
  loader: ({ context: { queryClient, useCases } }) =>
    queryClient.ensureQueryData(ordersQueryOptions(useCases.listOrders)),
});
```

### router-primitives-only-in-the-root → ui-never-touches-navigation · MUST

Only `root/` imports `@tanstack/react-router`. Its routes, the router's file and the navigation the root hands down import it, never an adapter or code of `libs/`, and a binding unit that answers the router, such as with `notFound`, takes that answer from the route that calls it.

#### Why

Code that imports the router outside the root changes with every change of the router or of a path, and a lib or an adapter that imports it knows the program's navigation; a binding unit handed `notFound` decides when the router answers it without depending on the router.

#### Examples

```tsx title="Avoid"
// src/presentation/screens/orders-screen/orders-screen.tsx
import { useNavigate } from '@tanstack/react-router';

export const OrdersScreen = ({ orders }: OrdersScreenProps): ReactElement => {
  const navigate = useNavigate();

  return (
    <OrderList
      orders={orders}
      onOpen={(orderId) => navigate({ to: '/orders/$orderId', params: { orderId } })}
    />
  );
};
```

```tsx title="Prefer"
// src/root/routes/orders/index.tsx
const OrdersRoute = (): ReactElement => {
  const navigate = Route.useNavigate();

  return (
    <OrdersScreen
      onOpenOrder={(orderId) => navigate({ to: '/orders/$orderId', params: { orderId } })}
    />
  );
};
```

### document-head-declared-by-route → document-metadata-owned-by-screen · MUST

Every screen's document metadata is declared in its route's `head`, which takes it from the surface of the screen's module.

#### Why

The router reads the metadata only from the route, so metadata declared elsewhere never reaches the head, and metadata written in the route itself is kept apart from the screen whose content it describes, and drifts from it.

#### Examples

```tsx title="Avoid"
export const Route = createFileRoute('/orders/')({
  head: () => ({ meta: [{ title: 'Orders | Shop' }] }),
  component: OrdersRoute,
});
```

```tsx title="Prefer"
import { ordersScreenHead } from '../../../presentation';

export const Route = createFileRoute('/orders/')({
  head: () => ordersScreenHead(),
  component: OrdersRoute,
});
```
