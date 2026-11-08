# Adapters

> Governs an adapter in a React program: its form.

## General

### adapter-is-a-factory-or-module-object → unit-handed-its-dependencies · MUST

Every adapter in a React program is a factory function or a module object, never a class. A factory takes the adapter's dependencies and returns the adapter; a module object serves where the adapter has no dependency and no state.

#### Why

A class's method handed to a hook or a handler loses its `this` and fails when called, where a method of a factory's object keeps working; a factory also shows every dependency in its signature, as the functions a React program is built of do.

#### Examples

```ts title="Avoid"
// src/features/cart/infrastructure/http/cart-api.adapter.ts
export class CartApiAdapter implements CartApiPort {
  constructor(private readonly http: KyInstance) {}

  async find(cartId: CartId, context: Context): Promise<Cart> {
    return parseCart(await this.http.get(`carts/${cartId}`, { signal: context.signal }).json());
  }
}
```

```ts title="Prefer"
// src/features/cart/infrastructure/http/cart-api.adapter.ts
export const createCartApi = (http: KyInstance): CartApiPort => ({
  find: async (cartId, context) =>
    parseCart(await http.get(`carts/${cartId}`, { signal: context.signal }).json()),
});
```
