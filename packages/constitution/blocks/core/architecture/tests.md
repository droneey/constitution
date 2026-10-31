# Tests

> Governs a spec's place in the tree: which units are its boundaries.

## Boundaries

### spec-boundaries-follow-the-tree · SHOULD

The boundaries of the tree are what a caller outside a folder reaches through its surface: a use case, an aggregate, a domain service, an adapter, a delivery unit, a reusable unit of a composition module, a lib, an entity or a value object that holds an invariant or a transition, and a unit of the root other than the wiring; the wiring gets no spec, composition gets one where it derives a fact or implements a contract, and a binding unit that is no delivery unit is proven through the units that consume it.

| Why |
|---|
| each of these is a unit another part of the program relies on, and what sits behind a surface is proven through it; a binding unit only hands an operation to the framework, so the unit that consumes it proves it the way its caller meets it. |
