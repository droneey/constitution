# Functions

> Governs a function in TypeScript: its parameter object and its return type.

## Parameters

### parameter-object-has-a-named-type · MUST

In a typed file, every exported function's parameter object has a named type. This holds for a function its module exports and for a member of an exported type, such as an interface's method; a function inside its module may type that object inline in its signature.

#### Why

An object typed inline in an exported signature has no name for callers and specs to build it by, so each spells its fields again, and the signature grows long to read and in its declarations.

#### Examples

```ts title="Avoid"
// src/features/invoices/application/contracts/invoice-repository.port.ts
export interface InvoiceRepositoryPort {
  find(query: { readonly invoiceId: InvoiceId; readonly signal: AbortSignal }): Promise<Invoice | undefined>;
}
```

```ts title="Prefer"
// src/features/invoices/application/contracts/invoice-repository.port.ts
export type FindInvoiceQuery = {
  readonly invoiceId: InvoiceId;
  readonly signal: AbortSignal;
};

export interface InvoiceRepositoryPort {
  find(query: FindInvoiceQuery): Promise<Invoice | undefined>;
}
```

## Return types

### return-type-no-wider-than-returned · MUST

Every declared return type is no wider than what its function returns. Exempt: a function that returns a contract, such as an interface, in place of its implementation's type.

#### Why

A wider annotation throws away what the compiler knew, and every caller narrows again.

#### Examples

```ts title="Avoid"
export const Cart = {
  lineCount: (cart: Cart): number | undefined => cart.lines.length,
};
```

```ts title="Prefer"
export const Cart = {
  lineCount: (cart: Cart): number => cart.lines.length,
};
```
