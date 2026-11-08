# Domain

> Governs the domain model in TypeScript: where the rules of an aggregate, an entity and a value object live, and where an aggregate's transitions live.

## Where rules live

### entity-rules-held-by-its-companion → rule-of-one-thing-lives-beside-its-data · MUST

Every rule of one aggregate, entity or value object is a function of its companion, never a method of a class. Such rules are the thing's predicates and derived values, and a value object's operations. Exempt: an enumeration, which has no companion.

| Why |
|---|
| an instance of a class loses its methods when it crosses a cache, storage, a worker or a message, which carry plain data as it is, and a rule kept apart from its type's name is looked for in every file that uses the type. |

### companion-function-takes-its-thing-first → rule-of-one-thing-lives-beside-its-data · SHOULD

Every rule a companion holds for its aggregate, entity or value object takes that thing as its first parameter. Such rules are the thing's predicates and derived values, and a value object's operations.

| Why |
|---|
| a function that takes its thing in another place reads differently at each call, so its reader looks up each signature of the companion before calling it, and a call that hands two values of one type in the wrong order still compiles. |

## Construction

### aggregate-never-built-by-a-literal-spread-or-clone → aggregate-changed-only-by-its-transitions · MUST

No code outside an aggregate's transitions and its rebuild from storage writes an object literal, a spread or a `structuredClone` of it. This holds for its inner entities too, in specs as in production.

| Why |
|---|
| the compiler accepts any object of the right shape as the aggregate, so only these functions keep a state nothing checked from existing. |

### aggregate-transition-kept-off-its-companion → surface-offers-operations-not-mechanisms · MUST

Every aggregate transition is a free function of its concept's `transitions/`, never a member of its aggregate's companion.

| Why |
|---|
| the companion goes onto the feature's surface with the aggregate's predicates and derived values, so a transition it holds goes there too, and a presentation or an adapter that imports the companion can change the aggregate. |
