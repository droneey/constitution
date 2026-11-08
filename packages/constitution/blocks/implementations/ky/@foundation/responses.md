# Responses

> Governs how a response body is parsed.

## General

### ky-body-parsed-by-schema → outside-value-unknown-until-parsed · MUST

Every response body is parsed by a schema, never typed by a type argument. It is read by `.json(schema)` with a Standard Schema validator, or by `.json()` with no type argument and then parsed; neither `.json<T>()` nor `ky<T>()` is written.

#### Why

A type argument only names a type and checks nothing, so a body the server changed reaches the program typed as what it no longer is, while `.json(schema)` throws a `SchemaValidationError` (ky's readme) — parse, don't validate.

#### Examples

```ts title="Avoid"
export const createCartApi = (http: KyInstance): CartApiPort => ({
  find: async (cartId, context) => http.get(`carts/${cartId}`, { signal: context.signal }).json<Cart>(),
});
```

```ts title="Prefer"
export const createCartApi = (http: KyInstance): CartApiPort => ({
  find: async (cartId, context) => http.get(`carts/${cartId}`, { signal: context.signal }).json(cartSchema),
});
```
