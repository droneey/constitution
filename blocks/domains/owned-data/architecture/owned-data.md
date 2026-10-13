# Owned data

> Governs aggregates and transactions.

## Aggregates

### aggregate-changed-only-through-its-root · MUST
An aggregate — an entity and what belongs to it — changes only through its root, the entity that keeps its invariants: no code reaches an inner entity to change it, and a command repository exists only for a root.

| Why | Tags |
|---|---|
| one entrance per aggregate means one place holds its invariants, and a change past the root skips them. | [data] |

### independent-entity-is-its-own-aggregate · SHOULD
An entity with a life of its own — created, changed or removed apart from its parent — is an aggregate of its own, which others reference by identifier.

| Why | Tags |
|---|---|
| an aggregate that holds what changes apart locks it on every change, and two people editing unrelated things collide. | [data] |

## Transactions

### transaction-changes-one-aggregate · SHOULD
A transaction changes one aggregate; a change that spans several reaches the others afterwards, by an event or a later step, each in a transaction of its own.

| Why | Tags |
|---|---|
| a transaction over several aggregates locks them together and binds their consistency into one, which their boundaries were drawn to keep apart. | [data] |
