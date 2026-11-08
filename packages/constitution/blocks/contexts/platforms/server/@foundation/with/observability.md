# Observability

> Governs what a server's telemetry signals say of its instance, and where its logs go.

## Signals

### server-telemetry-names-its-instance → telemetry-carries-the-service-identity · SHOULD

Every telemetry signal of a server carries, beside its service's identity, the identity of the instance that sent it.

#### Why

A fault of one instance, of its memory, its node or its release, is found only when that instance's telemetry signals can be told apart from its siblings'.

#### Examples

```yaml title="Avoid"
# deploy/orders.yaml
env:
  - name: OTEL_SERVICE_NAME
    value: orders   # every instance's signals look alike
```

```yaml title="Prefer"
# deploy/orders.yaml
env:
  - name: OTEL_SERVICE_NAME
    value: orders
  - name: POD_UID
    valueFrom:
      fieldRef:
        fieldPath: metadata.uid
  - name: OTEL_RESOURCE_ATTRIBUTES
    value: service.instance.id=$(POD_UID)
```

## Logs

### server-log-leaves-as-a-stream → diagnostics-written-through-a-logger · MUST

Every log of a server leaves it as a stream, never as a file inside its instance. Its logging facade writes its log records to standard output or standard error, or to a collector over the network.

#### Why

Its host gathers every instance's stream in one place, while a file inside an instance is lost when the instance is replaced and fills its disk until then.

#### Examples

```ts title="Avoid"
// src/root/logger.ts
export const createLogger = (level: Level): Logger =>
  pino({ level }, pino.destination("/var/log/orders/app.log"));   // lost with the instance, fills its disk
```

```ts title="Prefer"
// src/root/logger.ts
export const createLogger = (level: Level): Logger =>
  pino({ level }, pino.destination(1));
```
