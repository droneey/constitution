# Error boundaries

> Governs the failures of rendering, which a boundary catches, and those of a handler and an effect, which it does not.

## General

### screen-renders-inside-its-own-error-boundary → failure-contained-to-its-screen · MUST

Every screen renders inside an error boundary of its own, never only one at the root.

#### Why

React unmounts the whole tree below the boundary that catches, so with one boundary at the root a render error in one screen takes the whole program down.

#### Examples

```tsx title="Avoid"
export const App = (): ReactElement => (
  <ErrorBoundary fallback={<FailurePanel />}>
    <CartScreen />
    <CheckoutScreen />
  </ErrorBoundary>
);
```

```tsx title="Prefer"
export const App = (): ReactElement => (
  <ErrorBoundary fallback={<FailurePanel />}>
    <ErrorBoundary fallback={<ScreenFailure />}>
      <CartScreen />
    </ErrorBoundary>
    <ErrorBoundary fallback={<ScreenFailure />}>
      <CheckoutScreen />
    </ErrorBoundary>
  </ErrorBoundary>
);
```

### expected-failure-handled-in-its-handler-or-effect → catch-handles-only-what-it-recognises · MUST

Every expected failure of an event handler or an effect is handled in it, never left for an error boundary.

#### Why

React sends a boundary only the errors of rendering, so an expected failure left to a boundary is never shown and its user is never told what went wrong.

#### Examples

```ts title="Avoid"
const onApplyCoupon = async (code: string): Promise<void> => {
  await applyCoupon({ cartId, code });
};
```

```ts title="Prefer"
const onApplyCoupon = async (code: string): Promise<void> => {
  try {
    await applyCoupon({ cartId, code });
  } catch (error) {
    if (!(error instanceof CouponExpiredError)) {
      throw error;
    }

    setCouponFailure(error.code);
  }
};
```
