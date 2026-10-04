# Owned data

> An aggregate is the unit a change keeps consistent: an entity and what belongs to it, reached through its root, the entity that guards the rest. A domain event records what the aggregate decided.

## entities-guarded-where-the-program-owns-them · SHOULD
Where the program owns the data it changes, every change goes through its aggregate's root, which keeps the aggregate consistent; an aggregate stays small, and a child with a life of its own becomes an aggregate referenced by identifier.

| Why | Check | Tags |
|---|---|---|
| one entrance per aggregate means one place holds its invariants, and small aggregates keep a change from locking unrelated data. | review | [data] |
