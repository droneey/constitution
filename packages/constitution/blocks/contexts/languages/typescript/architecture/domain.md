# Domain

> Governs the domain model in TypeScript: the form of an aggregate and of its transitions, and of an entity or a value object with rules of its own.

## Where rules live

### entity-rules-held-by-its-companion → rule-of-one-thing-lives-beside-its-data · MUST

The predicates and derived values of an aggregate, an entity or a value object, and a value object's operations, are functions of its companion, never methods. An aggregate, an entity with rules of its own and a value object are each a `readonly` type whose predicates, derived values and, for a value object, operations — the sum of two amounts — its companion, the `const` object of its name declared in its file, holds as functions that take it as their first parameter; it is never a class with methods. An enumeration, whose `enum` already holds its name, has no companion: its predicates and derived values are functions its own file exports beside it.

| Why |
|---|
| an instance of a class loses its methods when it crosses a cache, storage, a worker or a message, which carry plain data as it is, and a rule kept apart from its type's name is looked for in every file that uses the type. |

## Construction

### aggregate-built-only-in-its-transitions → aggregate-changed-only-by-its-transitions · MUST

An aggregate is built and changed only in its concept's `transitions/` and by its rebuild from storage. Its starting transition and every move are free functions of `transitions/`, and its rebuild a free function its root's file exports beside the type, never members of its companion, so the feature's surface can leave the rebuild out; no object literal, spread or `structuredClone` of an aggregate's type, or of one of its inner entities', is written outside them, in specs as in production; a spec builds one through its starting transition or its rebuild from storage.

| Why |
|---|
| the compiler accepts any object of the right shape as the aggregate, so only these functions keep a state nothing checked from existing; a transition kept off the companion is a file the imports of the presentation and the adapters can be kept from, and a rebuild kept off it is a name the feature's surface can leave out. |
