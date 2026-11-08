# Effects

> Governs abort signals, timeouts, scoped resources and promises.

## Calls

### cancellation-by-abort-signal → outside-call-can-be-cancelled · SHOULD

Every function that makes a call across a process boundary takes an `AbortSignal` and hands it on. It takes the signal in its parameter object and hands it to each such call, whether it makes the call itself or through a function it calls.

#### Why

A call the signal does not reach keeps working after its caller gave up, and a cancellation in any other form is one no API of the platform takes.

#### Examples

```ts title="Avoid"
// src/features/catalog/infrastructure/http/price-list.adapter.ts
export const fetchPriceList = async ({ supplierId }: FetchPriceListInput): Promise<unknown> => {
  const response = await fetch(new URL(`suppliers/${supplierId}/prices`, SUPPLIER_API_URL), {
    signal: AbortSignal.timeout(SUPPLIER_TIMEOUT_MS),
  });
  return response.json();
};
```

```ts title="Prefer"
// src/features/catalog/infrastructure/http/price-list.adapter.ts
export const fetchPriceList = async ({ supplierId, signal }: FetchPriceListInput): Promise<unknown> => {
  const response = await fetch(new URL(`suppliers/${supplierId}/prices`, SUPPLIER_API_URL), {
    signal: AbortSignal.any([signal, AbortSignal.timeout(SUPPLIER_TIMEOUT_MS)]),
  });
  return response.json();
};
```

### outside-call-timed-out-by-abort-signal → outside-call-has-a-timeout · MUST

Every call across a process boundary whose client is given no timeout of its own is timed out by `AbortSignal.timeout(ms)`.

#### Why

A timer of the program's own is a timeout no API of the platform takes, so the call it should stop goes on after the time runs out.

#### Examples

```ts title="Avoid"
export const fetchRates = async ({ currency, signal }: FetchRatesInput): Promise<unknown> => {
  const response = await Promise.race([
    fetch(new URL(`rates/${currency}`, RATES_API_URL), { signal }),
    rejectAfter(RATES_TIMEOUT_MS),
  ]);
  return response.json();
};
```

```ts title="Prefer"
export const fetchRates = async ({ currency, signal }: FetchRatesInput): Promise<unknown> => {
  const response = await fetch(new URL(`rates/${currency}`, RATES_API_URL), {
    signal: AbortSignal.any([signal, AbortSignal.timeout(RATES_TIMEOUT_MS)]),
  });
  return response.json();
};
```

### timeout-signal-joined-to-the-callers → outside-call-can-be-cancelled · MUST

Wherever a call across a process boundary has its caller's signal and a timeout's, the two are joined by `AbortSignal.any`. Neither is put in the other's place.

#### Why

A call handed only one of the two signals ignores the other, so it runs on after the time is up or after its caller gave up.

#### Examples

```ts title="Avoid"
export const fetchShippingQuote = async ({ parcel, signal }: FetchShippingQuoteInput): Promise<unknown> => {
  const response = await fetch(QUOTES_URL, {
    method: 'POST',
    body: JSON.stringify(parcel),
    signal: AbortSignal.timeout(QUOTE_TIMEOUT_MS),  // the caller's signal is dropped
  });
  return response.json();
};
```

```ts title="Prefer"
export const fetchShippingQuote = async ({ parcel, signal }: FetchShippingQuoteInput): Promise<unknown> => {
  const response = await fetch(QUOTES_URL, {
    method: 'POST',
    body: JSON.stringify(parcel),
    signal: AbortSignal.any([signal, AbortSignal.timeout(QUOTE_TIMEOUT_MS)]),
  });
  return response.json();
};
```

## Resources

### scoped-resource-held-by-using → scoped-resource-released-by-the-scoped-form · MUST

Every resource whose life is one scope is held by `using` or `await using`. Such resources include a file handle, a lock, a temporary folder and a connection for one task.

#### Why

A release written in a `finally` is forgotten on the next path added.

#### Examples

```ts title="Avoid"
export const writeInvoicePdf = async ({ path, pdf }: WriteInvoicePdfInput): Promise<void> => {
  const file = await open(path, 'wx');
  try {
    await file.writeFile(pdf);
  } finally {
    await file.close();
  }
};
```

```ts title="Prefer"
export const writeInvoicePdf = async ({ path, pdf }: WriteInvoicePdfInput): Promise<void> => {
  await using file = await open(path, 'wx');
  await file.writeFile(pdf);
};
```

## Promises

### promise-awaited-returned-or-handed-to-a-scope → async-work-awaited-or-held-by-a-scope · MUST

Every promise is awaited, returned or handed to a scope that awaits it. No `void` discards one.

#### Why

A promise nobody awaits fails where nobody sees it, and the work it stands for outlives the code that started it.

#### Examples

```ts title="Avoid"
export const createPlaceOrder =
  ({ orderRepository, mailer }: PlaceOrderDependencies) =>
  async (input: PlaceOrderInput, context: Context): Promise<OrderId> => {
    const order = place(input);
    await orderRepository.add(order, context);
    void mailer.send(toConfirmationMail(order), context);
    return order.id;
  };
```

```ts title="Prefer"
export const createPlaceOrder =
  ({ orderRepository, mailer }: PlaceOrderDependencies) =>
  async (input: PlaceOrderInput, context: Context): Promise<OrderId> => {
    const order = place(input);
    await orderRepository.add(order, context);
    await mailer.send(toConfirmationMail(order), context);
    return order.id;
  };
```

### return-awaited-inside-try-or-using · MUST

Every promise returned inside a `try` block or a `using` declaration's scope is awaited where it is returned. It is written `return await`.

#### Why

Without the `await`, the function leaves the block before the promise fulfils or rejects, so its `catch` never sees the rejection, its `finally` runs too soon and a `using` releases the resource the work still needs.

#### Examples

```ts title="Avoid"
export const readOrderExport = async ({ path }: ReadOrderExportInput): Promise<string> => {
  await using file = await open(path);
  return file.readFile({ encoding: 'utf8' });  // the file closes before the read ends
};
```

```ts title="Prefer"
export const readOrderExport = async ({ path }: ReadOrderExportInput): Promise<string> => {
  await using file = await open(path);
  return await file.readFile({ encoding: 'utf8' });
};
```
