# Logs

> Governs the instance that writes every record: its mask, trace id, output and arguments.

## General

### one-instance-writes-every-record → log-record-passes-one-pipeline · MUST

One pino instance writes every record. It is created at the program's start, code logs through it or its children, and no second instance writes a record.

#### Why

The mask and the trace id are options of the instance, so a record a second instance writes carries neither: it leaks what the mask hides and joins no trace.

#### Examples

```ts title="Avoid"
// src/features/payments/infrastructure/stripe/payment-gateway.adapter.ts
import pino from 'pino';

const logger = pino({ name: 'payments' });
```

```ts title="Prefer"
// src/root/logger.ts
import pino from 'pino';
import { maskLine } from '../libs/masking';
import { traceMixin } from '../libs/tracing';

export const logger = pino({ mixin: traceMixin, hooks: { streamWrite: maskLine } });

// src/root/payments.ts
const paymentGateway = new PaymentGatewayAdapter(stripe, logger.child({ module: 'payments' }));
```

### secret-keys-masked-in-the-serialized-line → telemetry-value-masked-by-its-key · MUST

Every secret is masked in the serialized line, by the instance's `hooks.streamWrite`, which parses each line, masks it and writes it again. `redact` never stands in for it, as it matches exact paths, with case, and its wildcard spans one level.

#### Why

Only the serialized line holds every part of a record (its fields, a child's bindings and pino-http's request) so a mask in `formatters.log`, which sees the fields alone, leaves `req.headers.authorization` in the output.

#### Examples

```ts title="Avoid"
export const logger = pino({
  redact: ['password', 'token', 'req.headers.authorization'],
});
```

```ts title="Prefer"
// src/root/logger.ts
import { maskLine } from '../libs/masking';

export const logger = pino({
  hooks: { streamWrite: maskLine },
});
```

### json-lines-to-stdout-in-production → log-output-structured-in-production · SHOULD

Every instance in production writes JSON lines to stdout, its default destination, with no `transport`.

#### Why

A transport in production moves the writing to a worker thread that a collector reading stdout does not need, and pino-pretty's lines there are text the collector cannot parse.

#### Examples

```ts title="Avoid"
export const logger = pino({
  hooks: { streamWrite: maskLine },
  transport: { target: 'pino/file', options: { destination: 1 } },
});
```

```ts title="Prefer"
export const logger = pino({
  hooks: { streamWrite: maskLine },
  ...(config.logFormat === 'pretty' && { transport: { target: 'pino-pretty' } }),
});
```

### pino-pretty-transport-in-development → log-output-readable-in-development · SHOULD

Every instance in development takes `transport: { target: 'pino-pretty' }`.

#### Why

Pino's JSON lines are written for a collector, so a developer reading them in a terminal looks for the record they need among objects.

#### Examples

```ts title="Avoid"
export const logger = pino({
  hooks: { streamWrite: maskLine },
});
```

```ts title="Prefer"
export const logger = pino({
  hooks: { streamWrite: maskLine },
  ...(config.logFormat === 'pretty' && { transport: { target: 'pino-pretty' } }),
});
```

### trace-id-added-by-mixin → log-record-carries-the-trace-id · SHOULD

Every record takes the trace id from the instance's `mixin`. It returns the id from an `AsyncLocalStorage`, and the middleware of each request or task enters the id into that storage with its `run` before the work goes on.

#### Why

A trace id passed down by hand is missing from every record written where nobody passed it, while `mixin` runs for every record of the instance and its children, pino-http's included, so a record written after any await carries the id.

#### Examples

```ts title="Avoid"
export const placeOrderRoute = async (request: Request, traceId: TraceId): Promise<Response> => {
  logger.info({ traceId, cartId: request.body.cartId }, 'placing order');

  return placeOrder(parsePlaceOrderInput(request.body), traceId);
};
```

```ts title="Prefer"
// src/libs/tracing/trace-id.ts
const traceStore = new AsyncLocalStorage<TraceId>();

export const traceMixin = (): { traceId: TraceId | undefined } => ({
  traceId: traceStore.getStore(),
});

export const traceMiddleware = (request: IncomingMessage, next: () => void): void => {
  traceStore.run(readTraceId(request.headers), next);
};
```

### fields-first-message-second → log-record-is-an-event-with-fields · MUST

Every record's fields come first and its fixed message second. The fields object is the first argument and the message the second, never a message first with values after it.

#### Why

Pino puts a value after a message into the message only through a placeholder, and drops every value no placeholder takes, so a record written message first carries its values in its text, where no filter of fields finds them, or loses them without a warning.

#### Examples

```ts title="Avoid"
logger.info('order placed', { orderId: order.id, total: order.total });
```

```ts title="Prefer"
logger.info({ orderId: order.id, total: order.total }, 'order placed');
```
