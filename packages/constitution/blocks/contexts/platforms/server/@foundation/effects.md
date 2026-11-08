# Effects

> Governs a server's instances, its stop, its resources and the work it holds in flight, and its one-off work.

## Vocabulary

A server's **stop path** is the code that carries out its stop, from the stop signal to its exit.

A server's **pause for routing** is the wait from its removal from routing to the close of its listener.

**One-off work** is work a server needs done once per release or on demand, such as a seed, a backfill or a repair, a change to a store's schema being none, and a **one-off process** is a process that does it.

## General

### server-instance-keeps-only-what-it-can-lose · MUST

Every instance of a server keeps in its memory and on its disk only what it can lose. What it keeps there, such as a cache, a buffer or a temporary file, it can rebuild or abandon; a session, an upload, a lock that keeps its instances off the same work, a claim and the progress of work live in a store its instances share.

#### Why

Its host replaces, moves and multiplies instances without warning, so what one instance holds is lost at its restart and unseen by its siblings.

#### Examples

```ts title="Avoid"
// src/features/exports/infrastructure/memory/export-claims.adapter.ts
export const createExportClaims = (): ExportClaimsPort => {
  const running = new Set<ExportId>();   // unseen by sibling instances, lost at a restart

  return {
    claim: async (exportId) => {
      if (running.has(exportId)) return false;
      running.add(exportId);
      return true;
    },
  };
};
```

```ts title="Prefer"
// src/features/exports/infrastructure/redis/export-claims.adapter.ts
export const createExportClaims = (redis: Redis, instanceId: string): ExportClaimsPort => ({
  claim: async (exportId) =>
    (await redis.set(`export-claim:${exportId}`, instanceId, "PX", exportClaimTtlMs, "NX")) === "OK",
});
```

### server-serves-its-protocol-itself · SHOULD

Every server serves its protocol itself, needing no web server in front of it. A proxy or a load balancer may still stand in front of it, as its host chooses.

#### Why

A server that needs a web server in front of it runs only where that web server is configured for it, and each host configures it differently.

#### Examples

```ts title="Avoid"
// src/root/listeners.ts
export const openApiListener = (server: Server): void => {
  server.listen("/run/orders/orders.sock");   // answers only through the nginx its host must configure
};
```

```ts title="Prefer"
// src/root/listeners.ts
export const openApiListener = (server: Server, port: number): void => {
  server.listen({ host: "0.0.0.0", port });
};
```

## Stop

### server-stop-waits-out-its-pause-for-routing → stopping-program-takes-work-until-unrouted · MUST

When told to stop, every server keeps its listener open and answering until its pause for routing has passed. The project sets the pause above the time its routers take to let it go, and a pause its host spends before it signals the server counts toward it. Exempt: a second request to stop, which may end it at once.

#### Why

A host takes an instance out of routing and signals it at nearly the same moment, and no server can see when the last router has let it go, so one that closes its listener at once refuses requests already on their way to it.

#### Examples

```ts title="Avoid"
// src/libs/server-lifecycle/stop.ts
export const stopServer = async (server: RunningServer): Promise<void> => {
  server.readiness.markStopping();
  await server.closeListeners();   // refuses requests already on their way
  await server.releaseParts();
};
```

```ts title="Prefer"
// src/libs/server-lifecycle/stop.ts
import { setTimeout } from "node:timers/promises";

export const stopServer = async (server: RunningServer, pauseForRoutingMs: number): Promise<void> => {
  server.readiness.markStopping();
  await setTimeout(pauseForRoutingMs);
  await server.closeListeners();
  await server.releaseParts();
};
```

### server-stop-bound-shorter-than-the-hosts-grace → program-stops-cleanly · MUST

Every server's stop ends within a bound shorter than the time its host waits before it kills the process. The bound includes its pause for routing.

#### Why

Past the host's grace the process is killed mid-work, and the clean stop it started never ends.

#### Examples

```yaml title="Avoid"
# deploy/orders.yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: orders
          env:
            - name: PAUSE_FOR_ROUTING_SECONDS
              value: "10"
            - name: STOP_BOUND_SECONDS
              value: "40"   # the kill comes at 30
```

```yaml title="Prefer"
# deploy/orders.yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: orders
          env:
            - name: PAUSE_FOR_ROUTING_SECONDS
              value: "10"
            - name: STOP_BOUND_SECONDS
              value: "45"
```

### stop-signal-reaches-the-server-process → program-stops-cleanly · MUST

Every stop signal of a server's host reaches the server's own process. No wrapper stands between them, such as a shell, a script runner or a supervisor. Exempt: a wrapper that forwards every signal to the process and waits for it to exit.

#### Why

A signal a wrapper swallows never starts the clean stop, and the host kills the process when its grace runs out.

#### Examples

```dockerfile title="Avoid"
USER 10001
# npm takes SIGTERM and never passes it on
CMD ["npm", "run", "start"]
```

```dockerfile title="Prefer"
USER 10001
CMD ["node", "dist/main.js"]
```

## Resources and concurrency

### server-sized-to-the-hosts-grant · MUST

Every server sizes itself to what its host grants it, never to the machine it runs on. Its heap, its threads, its workers and its pools fit the memory and the processors its host grants it.

#### Why

A runtime that counts the machine's cores and memory takes more than its instance was given, and the host throttles it or kills it for memory it never had.

#### Examples

```ts title="Avoid"
// src/root/reports.ts
export const createReportWorkers = (): WorkerPool =>
  createWorkerPool({ size: os.cpus().length });   // the machine's 64 cores, not the 2 granted
```

```ts title="Prefer"
// src/root/reports.ts
export const createReportWorkers = (grantedProcessors: number): WorkerPool =>
  createWorkerPool({ size: grantedProcessors });
```

### server-work-in-flight-bounded → kept-collection-bounded · MUST

Every server that answers requests bounds the requests it holds, queued or under way, and refuses each beyond the bound at once. It refuses with its protocol's answer for a busy server.

#### Why

A burst queued without a bound waits past every caller's timeout, and the server spends its time on work nobody waits for any more — load shedding.

#### Examples

```ts title="Avoid"
// src/features/reports/presentation/bindings/queries/monthly-report.ts
export const createMonthlyReportHandler = (parts: MonthlyReportParts): Handler => {
  const queue = new PQueue({ concurrency: parts.concurrency });   // queues every burst without a bound

  return (request) => queue.add(() => parts.renderReport(request));
};
```

```ts title="Prefer"
// src/features/reports/presentation/bindings/queries/monthly-report.ts
export const createMonthlyReportHandler = (parts: MonthlyReportParts): Handler => {
  const queue = new PQueue({ concurrency: parts.concurrency });

  return (request) =>
    queue.size >= parts.maxQueued
      ? Promise.resolve(new Response(null, { status: 503, headers: { "Retry-After": "1" } }))
      : queue.add(() => parts.renderReport(request));
};
```

## Operations

### one-off-work-runs-as-its-own-process · MUST

All one-off work a server needs runs in a one-off process, never inside an instance's start.

#### Why

Every instance that starts would run it again, at the same time as its siblings, and a slow run holds back every restart.

#### Examples

```ts title="Avoid"
// src/root/run-server.ts
export const runServer = async (config: Config): Promise<void> => {
  const parts = assembleServer(config);

  await backfillInvoiceTotals(parts.invoices);   // every instance runs it again at each start
  openListeners(parts);
};
```

```ts title="Prefer"
// src/root/run-server.ts
export const runServer = (config: Config): void => {
  openListeners(assembleServer(config));
};

// src/entrypoints/backfill-invoice-totals/main.ts
import { runBackfillInvoiceTotals } from "../../root";

process.exitCode = await runBackfillInvoiceTotals(process.env);
```

### one-off-process-runs-from-the-servers-release · MUST

Every one-off process runs from its server's release, with the settings that release's instances are handed. Exempt: a credential, which the one-off process holds for its own work.

#### Why

A one-off process run from a checkout, an older release or another configuration works against a schema and a store the running release does not expect, so it writes what the instances misread or reaches another environment's store, while the credential is the job's own, since its rights differ from the instances'.

#### Examples

```yaml title="Avoid"
# deploy/backfill-invoice-totals.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backfill-invoice-totals
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: backfill
          image: registry.shop.example/orders:latest   # not the release the instances run
          command: ["node", "dist/entrypoints/backfill-invoice-totals/main.js"]
```

```yaml title="Prefer"
# deploy/backfill-invoice-totals.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backfill-invoice-totals
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: backfill
          image: registry.shop.example/orders:2026.11.3
          command: ["node", "dist/entrypoints/backfill-invoice-totals/main.js"]
          envFrom:
            - configMapRef:
                name: orders-2026.11.3
          volumeMounts:
            - name: backfill-credentials
              mountPath: /run/secrets
              readOnly: true
      volumes:
        - name: backfill-credentials
          secret:
            secretName: orders-backfill-credentials
```
