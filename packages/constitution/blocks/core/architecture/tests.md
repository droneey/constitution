# Tests

> Governs a spec's place in the tree: which units are its boundaries, and how the units that decide nothing are proven.

## Boundaries

### spec-boundaries-follow-the-tree · MUST

Each boundary of the tree gets its spec. The boundaries are what a caller outside a folder reaches through its surface: a use case with the parse of its operation input, an aggregate through its transitions, predicates and derived values, a domain service, a value object that holds an invariant, an adapter, a delivery unit, a binding unit that holds a decision, an interface-wide unit, a reusable unit of a composition module and a lib. A binding unit that only hands an operation to its framework is proven through the delivery units that consume it, and composition gets a spec where it derives a fact or implements a port. The composition root and the entry files, which decide nothing, get no spec of their own and are proven by the program's boot spec.

| Why |
|---|
| a unit another part of the program relies on that has no spec of its own breaks unseen, and a spec of what sits behind a surface breaks whenever that part moves while the behaviour stays; a binding unit that decides is proven where it decides, and one that only hands an operation over is proven the way its caller meets it. |
