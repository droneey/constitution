# Names

> Governs a name in TypeScript: the case of an identifier, a type parameter's included, and the spelling of a function's kind.

## Form

### name-cased-by-the-typescript-conventions → name-case-by-kind · MUST

Each kind of TypeScript name takes one case. Types, interfaces, classes, enums and enum members are PascalCase; a module-level constant initialised by a literal written out, such as a primitive, a regular expression, a template without expressions, or an object or array literal declared `as const`, is SCREAMING_SNAKE_CASE; a type's companion takes the type's name; functions, variables, instances, object and type keys, and every other value, one computed from constants included, are camelCase. Exempt: a name a contract imposes, such as a field of another party's format, and a name for what a framework renders, which takes the case that framework's block names.

#### Why

Where two kinds share a case, a reader takes a type for a value or a computed value for a fixed one until the declaration is read.

#### Examples

```ts title="Avoid"
const maxAttempts = 5;
const orderNumberPattern = /^ORD-\d{8}$/;
const LAST_ATTEMPT = maxAttempts - 1;  // computed, yet cased as a literal
```

```ts title="Prefer"
const MAX_ATTEMPTS = 5;
const ORDER_NUMBER_PATTERN = /^ORD-\d{8}$/;
const lastAttempt = MAX_ATTEMPTS - 1;
```

### type-parameter-named-by-a-leading-t · MUST

Every type parameter is `T`, or `T` followed by its role in PascalCase, such as `TItem`.

#### Why

A type parameter without its `T` shadows a concrete type of the same name unseen, so a reader takes the parameter for the type it hides.

#### Examples

```ts title="Avoid"
export type Page<Product> = {  // hides the Product type
  readonly items: readonly Product[];
  readonly nextCursor?: Cursor;
};
```

```ts title="Prefer"
export type Page<TItem> = {
  readonly items: readonly TItem[];
  readonly nextCursor?: Cursor;
};
```

### function-kinds-spelled-on-the-companion → function-named-for-what-it-does · SHOULD

Every parse of, conversion into and derived value of a type that has a companion is a member of that companion. One of a type that has none, such as an enumeration, is a free function. Exempt: a parse or a conversion from an outside system's own shape, such as a response or a row, which the code that reaches that system holds; a parse of one value's text, such as an amount's, is none.

#### Why

A free function beside the type it builds reads as one more helper, and a derived value named by its noun collides with a local binding of that noun; reached through its companion, each reads as what it builds and collides with nothing.

#### Examples

```ts title="Avoid"
// src/features/orders/domain/order/entities/order.aggregate.ts
export const Order = {
  isPaid: (order: Order): boolean => order.status === OrderStatus.Paid,
};

export const total = (order: Order): Money =>
  order.lines.reduce((sum, line) => Money.add(sum, line.price), Money.zero(order.currency));
```

```ts title="Prefer"
// src/features/orders/domain/order/entities/order.aggregate.ts
export const Order = {
  isPaid: (order: Order): boolean => order.status === OrderStatus.Paid,
  total: (order: Order): Money =>
    order.lines.reduce((sum, line) => Money.add(sum, line.price), Money.zero(order.currency)),
};
```
