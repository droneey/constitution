# Tools

> Governs the tools that hold the rules in TypeScript, and their findings: how a type error is suppressed and where its reason sits.

## Findings

### type-error-suppressed-by-ts-expect-error → suppression-silences-one-finding · MUST

Every type error kept on purpose is silenced by `@ts-expect-error`, never by `@ts-ignore` or `@ts-nocheck`.

#### Why

`@ts-expect-error` fails once the error it silences is gone, so it never outlives its reason, while `@ts-ignore` silences whatever error later lands on its line and `@ts-nocheck` a whole file.

#### Examples

```ts title="Avoid"
// src/features/orders/domain/order/value-objects/order-id.value-object.test-d.ts
test('should refuse an order id as an order number', () => {
  // Act
  const orderId = OrderId.create('ord_1');

  // Assert
  // @ts-ignore an OrderId is never an OrderNumber
  expectTypeOf(orderId).toEqualTypeOf<OrderNumber>();
});
```

```ts title="Prefer"
// src/features/orders/domain/order/value-objects/order-id.value-object.test-d.ts
test('should refuse an order id as an order number', () => {
  // Act
  const orderId = OrderId.create('ord_1');

  // Assert
  // @ts-expect-error an OrderId is never an OrderNumber
  expectTypeOf(orderId).toEqualTypeOf<OrderNumber>();
});
```

### type-error-suppression-gives-its-reason-on-its-line → suppression-states-its-reason · MUST

Every `@ts-expect-error` states its reason on the directive's line, after it.

#### Why

A reason on a line apart from the directive is not read where the directive is, and stays behind, or is lost, when the directive moves or goes.

#### Examples

```ts title="Avoid"
// src/features/orders/domain/order/value-objects/order-id.value-object.test-d.ts
test('should refuse an order id as an order number', () => {
  // Act
  const orderId = OrderId.create('ord_1');

  // Assert
  // An OrderId is never an OrderNumber.
  // @ts-expect-error
  expectTypeOf(orderId).toEqualTypeOf<OrderNumber>();
});
```

```ts title="Prefer"
// src/features/orders/domain/order/value-objects/order-id.value-object.test-d.ts
test('should refuse an order id as an order number', () => {
  // Act
  const orderId = OrderId.create('ord_1');

  // Assert
  // @ts-expect-error an OrderId is never an OrderNumber
  expectTypeOf(orderId).toEqualTypeOf<OrderNumber>();
});
```
