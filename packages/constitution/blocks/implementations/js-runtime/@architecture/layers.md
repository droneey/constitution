# Layers

> Governs the modules of the runtime that only the edge imports.

## Effects

### runtime-module-with-an-effect-imported-only-by-the-edge → effects-held-only-by-the-edge · MUST

Outside the edge, no file imports a module of the runtime that holds an effect. Those are the runtime's built-in modules that hold one, such as `child_process`, `cluster`, `dgram`, `dns`, `fs`, `http`, `http2`, `https`, `inspector`, `module`, `net`, `os`, `perf_hooks`, `process`, `quic`, `readline`, `repl`, `sqlite`, `tls`, `trace_events`, `tty`, `v8`, `vm`, `wasi` and `worker_threads`, with or without `node:` and with their subpaths.

#### Why

Each of these reaches the file system, the network, a process or the clock, so a unit of logic that imports one holds an effect no port shows, and its specs need the real effect or a patch of it.

#### Examples

```ts title="Avoid"
// src/features/invoices/application/use-cases/commands/issue-invoice.use-case.ts
import { writeFile } from 'node:fs/promises';

export const createIssueInvoice = ({ renderer }: IssueInvoiceDependencies) =>
  async (input: IssueInvoiceInput, context: Context): Promise<void> => {
    await writeFile(`invoices/${input.invoiceId}.pdf`, await renderer.render(input, context));
  };
```

```ts title="Prefer"
// src/features/invoices/application/use-cases/commands/issue-invoice.use-case.ts
export const createIssueInvoice = ({ renderer, archive }: IssueInvoiceDependencies) =>
  async (input: IssueInvoiceInput, context: Context): Promise<void> => {
    await archive.store(input.invoiceId, await renderer.render(input, context), context);
  };

// src/features/invoices/infrastructure/files/invoice-archive.adapter.ts
import { writeFile } from 'node:fs/promises';
```
