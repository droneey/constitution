# React DOM

> Governs specs that render into a document and query it.

## General

### spec-never-selects-from-the-document → element-found-by-role-label-or-text · MUST

No spec queries the document by a selector. A spec calls no `querySelector` or `querySelectorAll` on the container, the document or an element, and finds an element no person perceives by its `data-testid`. Exempt: the one spec of a selector the program configures a framework with, which queries through that selector's constant under a suppression that states why.

#### Why

A query of the document finds what its markup holds and breaks when the markup changes and the screen does not, while a `data-testid` is set for the spec alone and stays.

#### Examples

```tsx title="Avoid"
// Arrange
const { container } = renderScreen(<CartScreen cartId={cartId} />);

// Act
const total = container.querySelector('.cart-total');

// Assert
expect(total).toHaveTextContent('$42.00');
```

```tsx title="Prefer"
// Arrange
renderScreen(<CartScreen cartId={cartId} />);

// Act
const total = await screen.findByRole('status', { name: 'Total' });

// Assert
expect(total).toHaveTextContent('$42.00');
```

## Accessibility

### ui-specs-run-the-axe-scan → rendered-state-scanned-for-accessibility-once · MUST

Every screen or component spec scans with axe each state it renders that no narrower spec renders. A screen spec leaves a state a story renders to that story's scan. Axe's landmark rules, such as `region`, run only in screen specs, never over a lone component.

#### Why

A state no spec scans ships a violation a simulated document would have caught, found only by a person who cannot use the screen; a scan in each state's spec fails the change that brings it.

#### Examples

```tsx title="Avoid"
test('should show the coupon failure when the code has expired', async () => {
  // Arrange
  const user = userEvent.setup();
  renderComponent(<CouponField onApply={rejectExpired} />);

  // Act
  await user.type(screen.getByRole('textbox', { name: 'Coupon code' }), 'SPRING{Enter}');

  // Assert
  expect(await screen.findByRole('alert')).toHaveTextContent('This coupon has expired');
});
```

```tsx title="Prefer"
test('should show the coupon failure when the code has expired', async () => {
  // Arrange
  const user = userEvent.setup();
  const { container } = renderComponent(<CouponField onApply={rejectExpired} />);

  // Act
  await user.type(screen.getByRole('textbox', { name: 'Coupon code' }), 'SPRING{Enter}');

  // Assert
  expect(await screen.findByRole('alert')).toHaveTextContent('This coupon has expired');
  expect(await axe(container, { rules: { region: { enabled: false } } })).toHaveNoViolations();
});
```
