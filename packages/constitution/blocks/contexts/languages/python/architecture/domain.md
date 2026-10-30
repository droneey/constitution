# Domain

> Governs the form of an aggregate.

## Aggregates

### aggregate-changed-by-replace-in-its-module → aggregate-changed-only-by-its-transitions · MUST

An aggregate's transitions are its methods or the functions of its module, each returning a copy made by `dataclasses.replace`; no code outside that module calls its constructor, save through its `create`, or `replace` on it.

| Why |
|---|
| Python cannot keep a constructor private, so the module is the boundary, and `replace` runs `__post_init__` again, so the invariants hold after every transition. |
