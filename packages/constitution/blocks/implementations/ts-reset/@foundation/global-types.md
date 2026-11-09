# Global types

> Governs the types of what is parsed or fetched.

## General

### reset-loaded-only-by-programs → outside-value-unknown-until-parsed · MUST

ts-reset is loaded only by a program, once. A program, which no package imports, loads it from `src/reset.d.ts`, so `JSON.parse` and a response body's `json()` return `unknown`, not `any`, and a published package never loads it.

#### Why

The standard library types them `any`, which neither the compiler nor the lint reports, so outside data spreads through the program unchecked; a package that loads it changes the types of every program that installs it.

#### Examples

```ts title="Avoid"
// packages/billing/src/index.ts
import '@total-typescript/ts-reset';

export { createInvoice } from './invoices';
```

```ts title="Prefer"
// apps/shop/src/reset.d.ts
import '@total-typescript/ts-reset';
```
