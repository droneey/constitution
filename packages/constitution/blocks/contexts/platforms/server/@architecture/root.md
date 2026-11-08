# Root

> Governs how the composition root assembles a server's start and its stop.

## Assembly

### server-process-assembled-with-only-what-its-kind-needs → composition-root-assembles-the-program · MUST

The composition root assembles each kind of process a server runs with only the parts that kind uses. Such parts include its adapters, its pools and its listeners.

#### Why

A process assembled with parts it never uses opens connections, takes memory and fails on dependencies its work never touches.

#### Examples

```ts title="Avoid"
// src/root/run-invoice-worker.ts
export const runInvoiceWorker = async (config: Config): Promise<number> => {
  const parts = assembleEverything(config);   // opens the HTTP listener's pools and the search client too

  return consumeInvoiceRequests(parts.broker, parts.issueInvoice);
};
```

```ts title="Prefer"
// src/root/run-invoice-worker.ts
export const runInvoiceWorker = async (config: Config): Promise<number> => {
  const database = new Pool(config.database);
  const broker = await connectBroker(config.broker);
  const issueInvoice = createIssueInvoice({
    invoiceRepository: createInvoiceRepository(database),
  });

  return consumeInvoiceRequests(broker, issueInvoice);
};
```

### server-listeners-opened-last → composition-root-assembles-the-program · MUST

The composition root opens a server's listeners and consumers of messages last, only once every part they use is built.

#### Why

Work taken before the parts it uses are ready fails, though nothing is wrong with it.

#### Examples

```ts title="Avoid"
// src/root/run-server.ts
export const runServer = (config: Config): void => {
  const api = new Hono();

  serve({ fetch: api.fetch, port: config.publicPort });   // takes requests before the routes and the pool exist
  const database = new Pool(config.database);
  registerOrderRoutes(api, createOrderUseCases(database));
};
```

```ts title="Prefer"
// src/root/run-server.ts
export const runServer = (config: Config): void => {
  const api = new Hono();
  const database = new Pool(config.database);

  registerOrderRoutes(api, createOrderUseCases(database));
  serve({ fetch: api.fetch, port: config.publicPort });
};
```

### server-stop-closes-its-listeners-first → stateful-resource-released-by-the-programs-stop · MUST

The stop path closes a server's listeners and consumers of messages first. It closes every other part after them, in the reverse of the order the composition root built them.

#### Why

A part closed under work still running turns a clean stop into failures, and work still taken while the parts it uses close fails at once.

#### Examples

```ts title="Avoid"
// src/root/stop-server.ts
export const stopServer = async (parts: ServerParts): Promise<void> => {
  await parts.database.end();   // requests still running lose their store
  await parts.broker.close();
  await closeListener(parts.listener);
  await parts.invoiceConsumer.disconnect();
};
```

```ts title="Prefer"
// src/root/stop-server.ts
export const stopServer = async (parts: ServerParts): Promise<void> => {
  await closeListener(parts.listener);
  await parts.invoiceConsumer.disconnect();
  await parts.broker.close();
  await parts.database.end();
};
```
