# Layout

> Governs a server's tree: the entry file each kind of its processes starts from.

## Entries

### server-process-kind-started-from-its-own-entry-file · SHOULD

Each kind of process a server's artefact runs starts from an entry file of its own. Such kinds include the process that serves, a worker, a scheduler and a one-off process.

#### Why

A kind of process with no entry file of its own is started by a flag or a branch inside another kind's start, so its host cannot start, scale or stop it alone, and its reader finds what it runs only by tracing that start — the twelve-factor app.

#### Examples

```ts title="Avoid"
// src/main.ts
import { runInvoiceWorker, runServer } from "./root";

process.exitCode = process.env.PROCESS_KIND === "worker"   // the worker hides inside the server's start
  ? await runInvoiceWorker(process.env)
  : await runServer(process.env);
```

```ts title="Prefer"
// src/main.ts
import { runServer } from "./root";

process.exitCode = await runServer(process.env);

// src/entrypoints/invoice-worker/main.ts
import { runInvoiceWorker } from "../../root";

process.exitCode = await runInvoiceWorker(process.env);
```
