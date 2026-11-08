# Routes

> Governs a route: its loader, its code splitting, its file and layout, what it shows when it fails or no route matches, and the head it claims.

## Vocabulary

A route file sits in **`routes/`**{#file-routes}, where the router builds its tree from it.

## Loading

### screen-reads-start-in-the-loader · SHOULD

Every read a screen needs on arrival starts in its route's loader, before the screen renders. These reads start together, never one after another as its components mount.

#### Why

Reads started in components wait for each other, mount after mount, so the screen paints late and fills in by steps; reads in a loader run in parallel and before the first paint.

#### Examples

```tsx title="Avoid"
export const Route = createFileRoute('/orders/$orderId')({
  params: { parse: parseOrderParams },
  component: OrderRoute,
});
```

```tsx title="Prefer"
export const Route = createFileRoute('/orders/$orderId')({
  params: { parse: parseOrderParams },
  loader: ({ params, context: { queryClient, useCases } }) =>
    Promise.all([
      queryClient.ensureQueryData(orderQueryOptions(useCases.getOrder, params.orderId)),
      queryClient.ensureQueryData(shipmentQueryOptions(useCases.getShipment, params.orderId)),
    ]),
  component: OrderRoute,
});
```

### routes-split-automatically · SHOULD

Every route's code is split by the router's bundler plugin. A project that registers the router's own plugin sets `autoCodeSplitting: true` on it.

#### Why

A split written by hand is forgotten on the next route, whose code then loads with every screen, and the plugin's option is off by default (TanStack Router, file-based routing reference).

#### Examples

```ts title="Avoid"
export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react' }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
```

```ts title="Prefer"
export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
```

## Files and layouts

### tanstack-router-file-names-kept → file-name-in-its-owners-case · MUST

Every route file keeps the names TanStack Router builds its tree from. Such names are `__root.tsx`; a pathless layout `_<name>/route.tsx`; a group `(<name>)/`; a parameter `$<param>.tsx`; and a route that leaves its parent's layout, `<name>_.tsx`.

#### Why

The router builds its tree from these names alone, so a file named otherwise is a different route or none, and the screen it was meant for is missing.

#### Examples

```text title="Avoid"
src/root/routes/
├── root.tsx
├── account-layout.tsx
├── orders/
│   └── order-id.tsx
└── index.tsx
```

```text title="Prefer"
src/root/routes/
├── __root.tsx
├── _account/
│   └── route.tsx
├── orders/
│   └── $orderId.tsx
└── index.tsx
```

### layout-written-as-a-layout-route · MUST

Every layout is a layout route that renders `<Outlet/>`, as `<name>.tsx`, `<name>/route.tsx` or their pathless `_` forms, never an `index.tsx`.

#### Why

An `index.tsx` is a leaf route, so a layout placed there renders nothing below it.

#### Examples

```text title="Avoid"
src/root/routes/orders/
├── index.tsx          renders <Outlet/> for every order route
└── $orderId.tsx
```

```text title="Prefer"
src/root/routes/orders/
├── route.tsx
├── index.tsx
└── $orderId.tsx
```

## Failures

### not-found-declared-by-the-root → unknown-address-shows-the-not-found-screen · SHOULD

The root route declares the not-found component, which shows an address no route matches.

#### Why

The router shows the not-found component of the nearest route above an unmatched address that declares one, so without one on the root an address outside every such route meets the router's bare default.

#### Examples

```tsx title="Avoid"
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
```

```tsx title="Prefer"
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundScreen,
});
```

### error-component-per-route → failure-contained-to-its-screen · MUST

Each route that renders a screen declares its error component.

#### Why

A route's error component is the boundary of its screen, so a failed loader costs its route, with its own message, not the whole program.

#### Examples

```tsx title="Avoid"
export const Route = createFileRoute('/orders/$orderId')({
  params: { parse: parseOrderParams },
  component: OrderRoute,
});
```

```tsx title="Prefer"
export const Route = createFileRoute('/orders/$orderId')({
  params: { parse: parseOrderParams },
  component: OrderRoute,
  errorComponent: OrderRouteFailure,
});
```

## Head

### router-claims-the-head → browser-resources-have-one-writer · MUST

The router alone writes the head. The root renders `<HeadContent/>`, which renders the head's elements from the routes' `head`; no component renders `<title>`, `<meta>` or `<link>` itself.

#### Why

The router changes the head with the route, so an element a component renders would fight it on every navigation.

#### Examples

```tsx title="Avoid"
const RootLayout = (): ReactElement => (
  <>
    <title>{t`Shop`}</title>
    <Outlet />
  </>
);
```

```tsx title="Prefer"
const RootLayout = (): ReactElement => (
  <>
    <HeadContent />
    <Outlet />
  </>
);
```
