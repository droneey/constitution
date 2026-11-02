# Domain

> Governs the domain model in Python: where an aggregate, an entity or a value object answers what it is asked, and how it is built and changed by its transitions.

## Aggregates

### aggregate-changed-by-replace-in-its-transitions → aggregate-changed-only-by-its-transitions · MUST

An aggregate is built and changed only by the functions of its concept's `transitions/`. Its transitions — its starting transition, its rebuild from storage and every move — are functions there, never its methods: each move returns a copy made by `dataclasses.replace`, and the starting transition and the rebuild call its constructor; no code outside that folder calls the aggregate's constructor, or `replace` on it.

| Why |
|---|
| Python cannot keep a constructor private, so an aggregate built or copied outside its transitions skips the checks they make, and only a folder of their own lets the imports keep the presentation from them; a copy made by `replace` runs `__post_init__` again, so its invariants hold after every transition. |

### aggregate-reads-are-methods-of-its-dataclass → rule-of-one-thing-lives-beside-its-data · MUST

The predicates and derived values of an aggregate, an entity or a value object, and a value object's operations, are methods or properties of its dataclass. For an entity, that holds where it has rules of its own, and a value object's operations include the sum of two amounts: each predicate, derived value and operation is a method or a property of its dataclass, in its file, and none of an aggregate's or an entity's returns a changed copy of it. An enumeration's are methods or properties of its `enum` class.

| Why |
|---|
| a predicate, a derived value or an operation kept away from its type is written again by each caller that needs it, and a read that returns a changed copy makes a change the transitions never checked. |
