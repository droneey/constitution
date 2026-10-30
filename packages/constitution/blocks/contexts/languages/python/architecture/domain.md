# Domain

> Governs the model in Python: how an aggregate is built and changed by its transitions.

## Aggregates

### aggregate-changed-by-replace-in-its-transitions → aggregate-changed-only-by-its-transitions · MUST

An aggregate's `create`, `restore` and transitions are functions of its concept's `transitions/`, never its methods, each transition returning a copy made by `dataclasses.replace`; no code outside that folder calls the aggregate's constructor, or `replace` on it.

| Why |
|---|
| Python cannot keep a constructor private, so the folder is the boundary, which the presentation's imports can be kept from only as a package apart; `replace` runs `__post_init__` again, so the invariants hold after every transition. |
