# Domain

> Governs the form of an aggregate and of an entity with rules of its own.

## Where rules live

### aggregate-rules-held-by-its-companion → aggregate-rule-lives-in-its-module · MUST

An aggregate, and an entity with rules of its own, is a `readonly` type whose rules its companion — the `const` object of its name, declared in its file — holds as functions that take it as their first parameter — `Order.create`, `Order.ship(order, at)` — never a class with methods; it is changed only by those functions.

| Why |
|---|
| plain data crosses the query cache, storage, a worker and a server component as it is, and a brand alone lets a spread elsewhere make a changed copy that no transition checked. |
