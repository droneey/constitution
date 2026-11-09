# Layers

> Governs the layers in TypeScript: which units may set a timer.

## Effects

### set-timeout-called-only-at-the-edge → effects-held-only-by-the-edge · MUST

Every call of `setTimeout` or `setInterval` is an effect, held only by the edge. Exempt: a binding unit's timer that schedules its own work.

#### Why

A timer reads the clock, so code that sets one anywhere else waits on time no spec can hand in.

#### Examples

```ts title="Avoid"
// src/features/payments/application/use-cases/commands/confirm-payment.use-case.ts
export const createConfirmPayment =
  ({ paymentGateway }: ConfirmPaymentDependencies) =>
  async ({ paymentId }: ConfirmPaymentInput, context: Context): Promise<PaymentStatus> => {
    await new Promise((resolve) => setTimeout(resolve, SETTLE_DELAY_MS));
    return paymentGateway.status(paymentId, context);
  };
```

```ts title="Prefer"
// src/features/payments/application/use-cases/commands/confirm-payment.use-case.ts
export const createConfirmPayment =
  ({ paymentGateway, clock }: ConfirmPaymentDependencies) =>
  async ({ paymentId }: ConfirmPaymentInput, context: Context): Promise<PaymentStatus> => {
    await clock.wait(settleDelay, context);
    return paymentGateway.status(paymentId, context);
  };
```
