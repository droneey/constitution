# Domain

> Governs the model in TypeScript: the form of an aggregate and of its transitions, and of an entity with rules of its own.

## Where rules live

### aggregate-rules-held-by-its-companion → aggregate-rule-lives-in-its-concept · MUST

An aggregate, and an entity with rules of its own, is a `readonly` type whose predicates and derived values its companion — the `const` object of its name, declared in its file — holds as functions that take it as their first parameter — `Order.isPaid(order)`, `Order.total(order)` —, never a class with methods; an aggregate's `create`, `restore` and transitions are functions of its concept's `transitions/`, named with their aggregate: `createOrder`, `restoreOrder`, `shipOrder(order, at)`.

| Why |
|---|
| plain data crosses the query cache, storage, a worker and a server component as it is, which an instance of a class does not, and a transition apart from the type is a file the presentation's imports can be kept from. |

## Construction

### aggregate-built-only-in-its-transitions → aggregate-changed-only-by-its-transitions · MUST

No object literal, spread or `structuredClone` of an aggregate's type, or of one of its inner entities', is written outside its concept's `transitions/`, in specs as in production; a spec builds one through its `create` or `restore`.

| Why |
|---|
| the compiler accepts any object of the right shape as the aggregate, so only the folder keeps a state no transition checked from existing. |
