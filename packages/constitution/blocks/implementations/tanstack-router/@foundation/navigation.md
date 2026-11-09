# Navigation

> Governs a link, preloading and the focus after a navigation.

## General

### links-name-typed-targets · MUST

Every link names its route by typed `to` and `params`, never a path built from strings. Link data handed to another component is built with `linkOptions`.

#### Why

A typed target fails the type check when the route moves; a built string fails in the user's hands.

#### Examples

```tsx title="Avoid"
<Link to={`/orders/${order.id}`}>{order.number}</Link>
```

```tsx title="Prefer"
<Link to="/orders/$orderId" params={{ orderId: order.id }}>
  {order.number}
</Link>
```

### routes-preload-on-intent · SHOULD

Every router is created with `defaultPreload: 'intent'`, so hovering, focusing or touching a link starts its route's loader.

#### Why

Without it the loader starts only on the click, and the user waits for data that could have been on its way.

#### Examples

```ts title="Avoid"
export const createAppRouter = (context: RouterContext) =>
  createRouter({ routeTree, context });
```

```ts title="Prefer"
export const createAppRouter = (context: RouterContext) =>
  createRouter({ routeTree, context, defaultPreload: 'intent', defaultPreloadStaleTime: 0 });
```

### focus-moved-when-a-navigation-resolves → navigation-moves-focus-to-the-main-heading · MUST

The root route moves focus to the new screen's main heading when a navigation resolves. It subscribes to the router's `onResolved` event. Exempt: a navigation that only changes a parameter of the same screen.

#### Why

The router changes the screen without touching focus, so a keyboard or screen-reader user is left on a control of the old screen; the root sees every resolved navigation, so one handler there covers them all.

#### Examples

```tsx title="Avoid"
export const OrderScreen = ({ order }: OrderScreenProps): ReactElement => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), []);

  return <h1 ref={headingRef} tabIndex={-1}>{order.number}</h1>;
};
```

```tsx title="Prefer"
// src/root/navigation.hooks.ts
export const useFocusOnNavigation = (): void => {
  const router = useRouter();

  useEffect(
    () =>
      router.subscribe('onResolved', ({ pathChanged }) => {
        if (pathChanged) {
          document.querySelector<HTMLElement>('main h1')?.focus();
        }
      }),
    [router],
  );
};
```
