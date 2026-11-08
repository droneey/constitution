# Errors

> Governs a failure in TypeScript: its throws tag, its cause and the caught value.

## Kinds of failure

### expected-failure-named-by-a-throws-tag → expected-failure-documented-where-no-signature-names-it · SHOULD

Every expected failure a function throws is named in a `@throws` tag of its JSDoc. The tag gives the failure's type in braces and then its condition: `@throws {<Error>} when <condition>`.

#### Why

TypeScript has no checked exceptions, so its signatures name no failure, and a failure named nowhere else is one its caller learns of only when it is thrown; the tag is where the editor shows it to a caller, and its braces name the type the caller recognises it by.

#### Examples

```ts title="Avoid"
// src/features/orders/domain/order/transitions/order.transitions.ts
/** Cancels an order that has not shipped. */
export const cancel = (order: Order): Order => {
  if (order.status === OrderStatus.Shipped) {
    throw new OrderAlreadyShippedError(order.id);
  }
  return { ...order, status: OrderStatus.Cancelled };
};
```

```ts title="Prefer"
// src/features/orders/domain/order/transitions/order.transitions.ts
/**
 * Cancels an order that has not shipped.
 * @throws {OrderAlreadyShippedError} when the order has shipped
 */
export const cancel = (order: Order): Order => {
  if (order.status === OrderStatus.Shipped) {
    throw new OrderAlreadyShippedError(order.id);
  }
  return { ...order, status: OrderStatus.Cancelled };
};
```

## Catching and carrying

### cause-passed-in-the-cause-option → error-keeps-its-cause · MUST

Every error that maps another passes it in the `cause` option of its constructor.

#### Why

A cause kept anywhere but the standard `cause` is missed by the runtimes, loggers and debuggers that print the chain, so the original failure vanishes under the one that replaced it.

#### Examples

```ts title="Avoid"
// src/features/orders/infrastructure/postgres/order-repository.adapter.ts
export const createOrderRepository = (pool: Pool): OrderRepositoryPort => ({
  add: async (order, context) => {
    try {
      await insertOrder(pool, toOrderRow(order), context);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === UNIQUE_VIOLATION) {
        throw new OrderAlreadyExistsError(order.id);  // the database error is lost
      }
      throw error;
    }
  },
});
```

```ts title="Prefer"
// src/features/orders/infrastructure/postgres/order-repository.adapter.ts
export const createOrderRepository = (pool: Pool): OrderRepositoryPort => ({
  add: async (order, context) => {
    try {
      await insertOrder(pool, toOrderRow(order), context);
    } catch (error) {
      if (error instanceof DatabaseError && error.code === UNIQUE_VIOLATION) {
        throw new OrderAlreadyExistsError(order.id, { cause: error });
      }
      throw error;
    }
  },
});
```

### error-class-hands-its-cause-to-super → error-keeps-its-cause · MUST

Every error class whose constructor takes the `cause` option hands that option on to `super`.

#### Why

A class that takes the option and keeps it from `super` drops the cause its caller passed, so the chain ends at the new error though every call site passed the old one.

#### Examples

```ts title="Avoid"
// src/features/orders/application/contracts/order-already-exists.error.ts
export class OrderAlreadyExistsError extends AppError {
  constructor(
    readonly orderId: OrderId,
    options?: ErrorOptions,
  ) {
    super(`order ${orderId} already exists`);
  }
}
```

```ts title="Prefer"
// src/features/orders/application/contracts/order-already-exists.error.ts
export class OrderAlreadyExistsError extends AppError {
  constructor(
    readonly orderId: OrderId,
    options?: ErrorOptions,
  ) {
    super(`order ${orderId} already exists`, options);
  }
}
```

### caught-value-narrowed-by-instanceof-or-a-guard → catch-handles-only-what-it-recognises · MUST

Every `catch` reads its value only once `instanceof` or the error library's guard has recognised it.

#### Why

Anything can be thrown, by the program's dependencies too, so a caught value read as an `Error` without a check fails a second time inside the handler meant for the first.

#### Examples

```ts title="Avoid"
try {
  await mailer.send(toInvoiceMail(invoice), context);
} catch (error) {
  logger.warn({ invoiceId: invoice.id, reason: String(error) }, 'invoice not sent');
}
```

```ts title="Prefer"
try {
  await mailer.send(toInvoiceMail(invoice), context);
} catch (error) {
  if (!(error instanceof MailerUnavailableError)) {
    throw error;
  }
  logger.warn({ invoiceId: invoice.id, reason: error.message }, 'invoice not sent');
}
```
