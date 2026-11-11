# TypeScript

> Governs the names ast-grep refuses in TypeScript.

## Names

### ast-grep-refuses-empty-names → name-never-an-empty-word · MUST

Every variable named only by an empty word fails ast-grep's scan. A variable, a parameter or a destructured field named only by one of the empty names fails it wherever the setting applies; one that holds a value whose shape the code does not know takes a suppression that says so.

#### Why

A naming rule left to review is broken as soon as nobody reads for it; a list of words is what a lint can hold of the rule, and the suppression is where the code says it knows nothing of the value's shape.

#### Examples

```ts title="Avoid"
const data = await orderRepository.find(orderId, context);

return data.total;
```

```ts title="Prefer"
const order = await orderRepository.find(orderId, context);

return order.total;
```

### ast-grep-refuses-empty-verbs → name-never-an-empty-word · MUST

Every function named only by an empty verb fails ast-grep's scan. A function or a method named only by one of the empty verbs fails it; a proxy's handler passes, and another name an implemented contract imposes takes a suppression that says so.

#### Why

A naming rule left to review is broken as soon as nobody reads for it, and a list of verbs is what a lint can hold of it; the lint sees a proxy's handler, and no other contract that imposes a name, which a suppression names instead.

#### Examples

```ts title="Avoid"
export const handle = async (input: CancelOrderInput, context: CallContext): Promise<void> => {
  await orderRepository.save(cancel(await orderRepository.find(input.orderId, context)), context);
};
```

```ts title="Prefer"
export const cancelOrder = async (input: CancelOrderInput, context: CallContext): Promise<void> => {
  await orderRepository.save(cancel(await orderRepository.find(input.orderId, context)), context);
};
```
