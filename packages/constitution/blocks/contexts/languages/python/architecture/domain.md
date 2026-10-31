# Domain

> Governs the model in Python: where an aggregate answers what it is asked, and how it is built and changed by its transitions.

## Aggregates

### aggregate-changed-by-replace-in-its-transitions → aggregate-changed-only-by-its-transitions · MUST

An aggregate's `create`, `restore` and transitions are functions of its concept's `transitions/`, never its methods, each transition returning a copy made by `dataclasses.replace`; no code outside that folder calls the aggregate's constructor, or `replace` on it.

| Why |
|---|
| Python cannot keep a constructor private, so the folder is the boundary, which the presentation's imports can be kept from only as a package apart; `replace` runs `__post_init__` again, so the invariants hold after every transition. |

### aggregate-reads-are-methods-of-its-dataclass → aggregate-rule-lives-in-its-concept · MUST

An aggregate's predicates and derived values, and those of an entity with rules of its own, are methods or properties of its dataclass, in its file — `order.is_paid`, `order.total()` — and none of them returns a changed copy.

| Why |
|---|
| a reader finds what an aggregate answers on the aggregate itself, while every change stays in the transitions that check it. |
