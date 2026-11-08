# HTTP

> Governs how a server's connections, its stop and its probes meet HTTP.

## Connections

### stopping-server-closes-each-connection · MUST

Once its stop begins, every server closes each connection it keeps open after the answer in flight on it is sent. It closes an HTTP/1.1 connection by `Connection: close` and an HTTP/2 one by `GOAWAY`, and ends a WebSocket or an event stream by its protocol's close, so its caller reconnects to another instance.

#### Why

A caller on a kept connection sends its next request to an instance that is leaving, and a long-lived connection held to the end is cut by the kill with no word to reconnect.

#### Examples

```ts title="Avoid"
// src/features/orders/presentation/bindings/queries/order-events.ts
export const serveOrderEvents = (followOrder: FollowOrder): Handler => (c) =>
  streamSSE(c, async (stream) => {
    for await (const event of followOrder(c.req.param("orderId"))) {   // held open until the kill cuts it
      await stream.writeSSE({ event: event.name, data: JSON.stringify(event) });
    }
  });
```

```ts title="Prefer"
// src/features/orders/presentation/bindings/queries/order-events.ts
export const serveOrderEvents = (followOrder: FollowOrder, stopping: AbortSignal): Handler => (c) =>
  streamSSE(c, async (stream) => {
    for await (const event of followOrder(c.req.param("orderId"), { signal: stopping })) {
      await stream.writeSSE({ event: event.name, data: JSON.stringify(event) });
    }
  });
```

### server-idle-connection-outlasts-the-proxy → request-read-within-a-time-bound · MUST

Behind a proxy or a load balancer, every server keeps idle connections open longer than what stands in front of it does.

#### Why

A proxy that sends a request down a connection the server has just closed gets a reset, and its caller an error for a request nobody served.

#### Examples

```ts title="Avoid"
// src/root/listeners.ts
export const createApiServer = (handler: RequestListener): Server => {
  const server = createServer(handler);

  server.keepAliveTimeout = 30_000;   // the load balancer keeps idle connections for 60 s
  return server;
};
```

```ts title="Prefer"
// src/root/listeners.ts
export const createApiServer = (handler: RequestListener, proxyIdleTimeoutMs: number): Server => {
  const server = createServer(handler);

  server.keepAliveTimeout = proxyIdleTimeoutMs + keepAliveMarginMs;
  return server;
};
```

## Probes

### probe-answer-holds-only-its-status · MUST

Every probe a server serves over HTTP answers with its status code. Its body names no version, no dependency and no error.

#### Why

A probe is reached by whoever reaches its address, and a version, a dependency's name or an error tells an attacker what to aim at.

#### Examples

```ts title="Avoid"
// src/libs/server-lifecycle/probes.ts
probes.get("/readyz", (c) =>
  c.json(
    { release, database: "postgres 16.4", error: lastFailure?.message },   // tells an attacker what to aim at
    isReady(server.state(), readinessPolicy) ? 200 : 503,
  ));
```

```ts title="Prefer"
// src/libs/server-lifecycle/probes.ts
probes.get("/readyz", (c) => c.body(null, isReady(server.state(), readinessPolicy) ? 204 : 503));
```
