# Health

> Governs a server's probes, what they report, and the wait for the systems it depends on at its start.

## Vocabulary

A server's **liveness check** and its **readiness check** are the probes its host calls: on a failed liveness check its host restarts it, and by its readiness check its host decides whether to route work to it.

A server's **required system** is a system the server cannot serve any request without.

## General

### server-liveness-reports-the-process-alone · MUST

Every liveness check of a server reports only whether its process still makes progress. It never reaches a store, a broker or another system.

#### Why

Its host restarts what fails the check, so one that reaches a shared dependency restarts every instance at once when that dependency fails, and a partial outage becomes a full one.

#### Examples

```ts title="Avoid"
// src/libs/server-lifecycle/probes.ts
probes.get("/livez", async (c) => {
  await database.query("select 1");   // a store outage restarts every instance at once
  return c.body(null, 204);
});
```

```ts title="Prefer"
// src/libs/server-lifecycle/probes.ts
probes.get("/livez", (c) => c.body(null, 204));
```

### server-readiness-reports-what-serving-needs · MUST

Where its host routes by one, every server's readiness check fails while the server cannot serve, and passes otherwise. It fails until the server has started, from the moment it is told to stop, and while a required system stays out of reach past a timeout and a count of failures the project sets above that system's usual spikes. Exempt: a required system out of reach since the start, which keeps the check failing as `server-start-outwaits-its-dependencies` gives.

#### Why

The host routes work only to a ready instance, so an instance that cannot serve leaves rotation without a restart and returns when it can, while a check that failed on one blip of a system every instance shares would take them all out at once.

#### Examples

```ts title="Avoid"
// src/libs/server-lifecycle/probes.ts
probes.get("/readyz", async (c) => {
  const isReachable = await database.ping();   // one blip takes every instance out; ready while stopping

  return c.body(null, isReachable ? 204 : 503);
});
```

```ts title="Prefer"
// src/libs/server-lifecycle/probes.ts
probes.get("/readyz", (c) => c.body(null, isReady(server.state(), readinessPolicy) ? 204 : 503));

// src/libs/server-lifecycle/readiness.ts
export const isReady = (state: ServerState, policy: ReadinessPolicy): boolean =>
  state.phase === ServerPhase.Serving &&
  state.requiredSystems.every((system) => system.failuresInARow < policy.failuresBeforeUnready);
```

### server-start-outwaits-its-dependencies · MUST

Every server starts whatever the state of the systems it depends on. A system out of reach at its start never makes the start fail, and a required system out of reach keeps the server's readiness check, where it has one, failing until the server reaches it.

#### Why

A host starts instances and their dependencies in no fixed order, and a server that exits when one is late restarts in a loop that delays its own recovery.

#### Examples

```ts title="Avoid"
// src/root/run-server.ts
export const runServer = async (config: Config): Promise<void> => {
  const database = new Pool(config.database);

  await database.query("select 1");   // a late store fails the start, and the host restarts it in a loop
  openListeners(assembleServer(config, database));
};
```

```ts title="Prefer"
// src/root/run-server.ts
export const runServer = (config: Config): void => {
  const database = new Pool(config.database);
  const readiness = createReadiness({
    requiredSystems: [checkOrdersDatabase(database)],
    policy: config.readiness,
  });

  openListeners(assembleServer(config, database, readiness));
};
```

### probe-served-apart-from-the-public-address · SHOULD

Every server serves its probes on an address its host reaches and its public callers do not.

#### Why

A probe on the public address is open to every caller, who learns when instances fail and can spend the server's work on checks.

#### Examples

```ts title="Avoid"
// src/root/listeners.ts
export const openListeners = (api: Hono, config: ListenerConfig): void => {
  api.get("/readyz", (c) => c.body(null, 204));   // open to every public caller
  serve({ fetch: api.fetch, port: config.publicPort });
};
```

```ts title="Prefer"
// src/root/listeners.ts
export const openListeners = (api: Hono, probes: Hono, config: ListenerConfig): void => {
  serve({ fetch: api.fetch, port: config.publicPort });
  serve({ fetch: probes.fetch, port: config.probePort });
};
```
