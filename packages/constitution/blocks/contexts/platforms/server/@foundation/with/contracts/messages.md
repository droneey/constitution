# Messages

> Governs the liveness of a server that consumes messages, and when its message consumers take them.

## Consuming

### consumer-liveness-reports-its-loop · MUST

Every liveness check of a server that consumes messages reports whether its message consumer's loop still turns. It never reports only whether the process answers, and the loop turns when it took, settled or waited for a message, or retried its connection to the message broker, or stood paused as `consumer-takes-messages-only-while-ready` gives, within a bound the project sets.

#### Why

A message consumer whose loop hangs still answers a probe of the process, and holds its messages unsettled while its host sees nothing wrong.

#### Examples

```ts title="Avoid"
// src/libs/server-lifecycle/probes.ts
probes.get("/livez", (c) => c.body(null, 204));   // answers while the consumer's loop hangs
```

```ts title="Prefer"
// src/libs/server-lifecycle/probes.ts
probes.get("/livez", (c) => c.body(null, consumerHeartbeat.isTurning() ? 204 : 503));

// src/libs/server-lifecycle/loop-heartbeat.ts
export const createLoopHeartbeat = (boundMs: number): LoopHeartbeat => {
  let lastTurnAt = performance.now();

  return {
    turned: () => {
      lastTurnAt = performance.now();
    },
    isTurning: () => performance.now() - lastTurnAt < boundMs,
  };
};
```

### consumer-takes-messages-only-while-ready · MUST

Every message consumer of a server takes messages only while the server can serve. It follows the server's readiness check where the server has one, subscribes to its message channels once the server can serve and pauses while it cannot, a paused message consumer counting as out of routing.

#### Why

A message taken before the store is reached, or while it cannot be reached, fails for no fault of its own and returns as a redelivery that counts against its attempts.

#### Examples

```ts title="Avoid"
// src/root/invoice-consumer.ts
export const startInvoiceConsumer = async (consumer: InvoiceConsumer): Promise<void> => {
  await consumer.subscribe();   // takes messages while the store is still out of reach
};
```

```ts title="Prefer"
// src/root/invoice-consumer.ts
export const startInvoiceConsumer = (consumer: InvoiceConsumer, readiness: Readiness): void => {
  readiness.onChange((isReady) => (isReady ? consumer.resume() : consumer.pause()));
};
```
