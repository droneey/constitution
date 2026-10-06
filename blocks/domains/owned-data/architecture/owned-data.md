# Owned data

> An aggregate is the unit a change keeps consistent: an entity and what belongs to it, reached through its root, the entity that guards the rest.

### changes-through-the-aggregate-root · SHOULD
Every change goes through its aggregate's root, which keeps the aggregate consistent; an aggregate stays small, and a child with a life of its own becomes an aggregate referenced by identifier.

| Why | Tags |
|---|---|
| one entrance per aggregate means one place holds its invariants, and small aggregates keep a change from locking unrelated data. | [data] |

### command-repository-per-aggregate-root → changes-through-the-aggregate-root · MUST
Only an aggregate's root has a command repository; the entities inside the aggregate change through their root.

| Why | Tags |
|---|---|
| a write that reaches an entity past its root skips the invariants the root keeps. | [data] |
