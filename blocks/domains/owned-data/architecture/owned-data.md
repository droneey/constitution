# Owned data

## entities-guarded-where-the-program-owns-them · SHOULD
Where the program owns the data it changes, every change goes through its aggregate's root, which keeps the aggregate consistent; an aggregate stays small, and a child with a life of its own becomes an aggregate referenced by identifier.

| Why | Check | Tags |
|---|---|---|
| one entrance per aggregate means one place holds its invariants, and small aggregates keep a change from locking unrelated data. | review | [data] |
