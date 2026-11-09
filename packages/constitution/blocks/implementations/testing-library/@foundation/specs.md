# Specs

> Governs the specs that render the user interface: interactions, waits and providers.

## Vocabulary

The **render helper** is the one function, in a fixtures file beside the specs, that mounts the unit a case renders with the providers it needs.

## General

### interactions-through-user-event · SHOULD

Every interaction goes through `userEvent`, never `fireEvent`.

#### Why

`fireEvent` dispatches one event where a person's action makes a sequence (focus, keys, pointer) so a spec on it passes on a control a person cannot use.

#### Examples

```tsx title="Avoid"
test('should add the product when the button is pressed', async () => {
  // Arrange
  const { cart } = renderScreen(<ProductScreen productId={productId} />);

  // Act
  fireEvent.click(await screen.findByRole('button', { name: 'Add to cart' }));

  // Assert
  expect(cart.lines).toEqual([createCartLine()]);
});
```

```tsx title="Prefer"
test('should add the product when the button is pressed', async () => {
  // Arrange
  const user = userEvent.setup();
  const { cart } = renderScreen(<ProductScreen productId={productId} />);

  // Act
  await user.click(await screen.findByRole('button', { name: 'Add to cart' }));

  // Assert
  expect(cart.lines).toEqual([createCartLine()]);
});
```

### async-ui-awaited-with-find → test-never-sleeps-a-fixed-time · SHOULD

Everything that appears asynchronously is awaited with `findBy…` or `waitFor`.

#### Why

A query that does not wait fails before the screen shows what it waits for, and a fixed delay is too short on a slow machine; `findBy…` and `waitFor` retry until the screen shows it, or fail when their timeout passes.

#### Examples

```tsx title="Avoid"
// Act
renderScreen(<OrderScreen orderId={orderId} />);
await new Promise((resolve) => setTimeout(resolve, 500));

// Assert
expect(screen.getByRole('heading', { name: 'Order 1042' })).toBeVisible();
```

```tsx title="Prefer"
// Act
renderScreen(<OrderScreen orderId={orderId} />);

// Assert
expect(await screen.findByRole('heading', { name: 'Order 1042' })).toBeVisible();
```

### render-helper-builds-fresh-providers → case-independent-of-order · MUST

The render helper mounts fresh providers for each case.

#### Why

Providers shared between cases carry one case's state into the next, so a case passes or fails by the order they run in.

#### Examples

```tsx title="Avoid"
// __tests__/cart.fixtures.tsx
const queryClient = new QueryClient();

export const renderScreen = (ui: ReactElement): RenderResult =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
```

```tsx title="Prefer"
// __tests__/cart.fixtures.tsx
export const renderScreen = (ui: ReactElement): RenderResult => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};
```

### ui-spec-renders-through-the-render-helper · SHOULD

Every spec that renders the interface renders through the render helper, never mounting providers by hand.

#### Why

Providers mounted by hand in each spec drift from the real composition and from one another, so a spec passes over a tree the program never builds.

#### Examples

```tsx title="Avoid"
// Arrange
render(
  <QueryClientProvider client={new QueryClient()}>
    <I18nProvider i18n={i18n}>
      <CartScreen cartId={cartId} />
    </I18nProvider>
  </QueryClientProvider>,
);
```

```tsx title="Prefer"
// Arrange
renderScreen(<CartScreen cartId={cartId} />);
```
