# Deployment

> Governs the reading of the environment under a JavaScript runtime.

## Environment

### process-env-read-only-by-the-provider → configuration-inputs-read-only-by-the-configuration-provider · MUST

Only the configuration provider reads `process.env`, or any alias of it the runtime offers at run time. Exempt: a spec, which may read it to drive the program.

#### Why

A read of it anywhere else, an entry file included, is a dependency on the process that no signature shows, so the unit that makes it cannot be run or tested apart from the environment it reads.

#### Examples

```ts title="Avoid"
// src/features/payments/infrastructure/http/payments-api.adapter.ts
export const createPaymentsApi = (http: KyInstance): PaymentsApiPort => ({
  charge: async (amount, context) =>
    parseCharge(await http.post('charges', {
      json: { amount, account: process.env.PAYMENTS_ACCOUNT },
      signal: context.signal,
    }).json()),
});
```

```ts title="Prefer"
// src/features/payments/infrastructure/http/payments-api.adapter.ts
export const createPaymentsApi = (http: KyInstance, account: PaymentsAccount): PaymentsApiPort => ({
  charge: async (amount, context) =>
    parseCharge(await http.post('charges', {
      json: { amount, account },
      signal: context.signal,
    }).json()),
});

// src/infrastructure/config/config.ts
export const parseConfig = (env: NodeJS.ProcessEnv): Config => configSchema.parse(env);
```
