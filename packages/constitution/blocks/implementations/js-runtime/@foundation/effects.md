# Effects

> Governs what blocks the event loop on the path of a request under a JavaScript runtime.

## Event loop

### request-path-calls-no-sync-io · MUST

No code on the path of a request or an event the program serves blocks the event loop with synchronous work. It makes no synchronous input or output call, such as `readFileSync` or `execFileSync`, and runs heavy work, such as a key derivation by `pbkdf2Sync` or `scryptSync`, off the event loop, such as in a worker.

#### Why

One synchronous call stalls the event loop, and every request the process holds waits behind it.

#### Examples

```ts title="Avoid"
export const createInvoiceTemplate = (): InvoiceTemplate => ({
  render: (invoice) => fill(readFileSync(TEMPLATE_PATH, 'utf8'), invoice),
});
```

```ts title="Prefer"
export const createInvoiceTemplate = (): InvoiceTemplate => ({
  render: async (invoice) => fill(await readFile(TEMPLATE_PATH, 'utf8'), invoice),
});
```
