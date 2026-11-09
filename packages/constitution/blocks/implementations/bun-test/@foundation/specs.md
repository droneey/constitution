# Specs

> Governs what a spec may call: its matchers, its mocks, its retries and its waits.

## General

### strict-matcher-only → case-asserts-by-strict-equality · MUST

Every case compares two values by `toStrictEqual` or `toBe`, never by a loose matcher. It never uses one such as `toEqual`, `toMatchObject`, `expect.objectContaining`, `expect.arrayContaining`, `toBeTruthy` or `toBeFalsy`.

#### Why

These pass on a partial or loose match (`toEqual` ignores undefined fields and class types, the others whole parts of the outcome) so a case passes on an outcome that differs.

#### Examples

```ts title="Avoid"
expect(placeOrder(cart)).toMatchObject({ status: 'placed' });
```

```ts title="Prefer"
expect(placeOrder(cart)).toStrictEqual({ orderId: 'order-1', status: 'placed', total: 1200 });
```

### bun-spec-mocks-no-module → effect-faked-never-mocked · MUST

No spec mocks a module. It calls no `mock.module`, in any of its spellings, such as `vi.mock` and `jest.mock`, and no `spyOn` over a real module.

#### Why

These are Bun's two ways to put another function in a module's place, so a spec that uses them proves the replacement instead of the code, and breaks when the module moves.

#### Examples

```ts title="Avoid"
mock.module('../payments/payment-gateway', () => ({
  charge: async () => ({ reference: 'pay-1' }),
}));
```

```ts title="Prefer"
const checkOut = createCheckOut({ payments: createPaymentsFake({ reference: 'pay-1' }) });
```

### bun-test-retries-no-case → flaky-test-fixed-never-retried · MUST

No run of the specs retries a failed case. No case passes a `retry` option, no `bunfig` sets `retry` under `[test]`, and no script passes `--retry` to `bun test`.

#### Why

A retried case passes on its second try and hides the race that failed the first, and Bun takes a retry from the case, from `bunfig` and from the command line alike.

#### Examples

```ts title="Avoid"
test('should send the invoice when the order is paid', async () => {
  // Arrange
  const sendInvoice = createSendInvoice({ mailer: createMailerFake() });
  // Act
  const status = await sendInvoice(paidOrder);
  // Assert
  expect(status).toBe('sent');
}, { retry: 3 });
```

```ts title="Prefer"
test('should send the invoice when the order is paid', async () => {
  // Arrange
  const sendInvoice = createSendInvoice({ mailer: createMailerFake() });
  // Act
  const status = await sendInvoice(paidOrder);
  // Assert
  expect(status).toBe('sent');
});
```

### bun-spec-never-sleeps → test-never-sleeps-a-fixed-time · MUST

No spec sleeps a fixed time. It calls neither `Bun.sleep`, `Bun.sleepSync` nor the `setTimeout` of `node:timers/promises`, and calls no `setTimeout` inside a promise.

#### Why

These are the fixed delays a spec reaches for, too short on a slow machine, where the spec fails at random, and wasted on a fast one; the fake clock of `bun:test` or a wait on a condition replaces them.

#### Examples

```ts title="Avoid"
test('should expire the cart when 30 minutes pass', async () => {
  // Arrange
  const cart = openCart();
  // Act
  await Bun.sleep(1_800_000);
  // Assert
  expect(cart.isExpired()).toBe(true);
});
```

```ts title="Prefer"
test('should expire the cart when 30 minutes pass', () => {
  // Arrange
  setSystemTime(new Date('2026-03-01T10:00:00Z'));
  const cart = openCart();
  // Act
  setSystemTime(new Date('2026-03-01T10:30:00Z'));
  // Assert
  expect(cart.isExpired()).toBe(true);
});
```
