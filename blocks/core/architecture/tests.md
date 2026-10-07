# Tests

> Governs which units of the tree are a spec's boundaries.

## Boundaries

### spec-boundaries-follow-the-tree · SHOULD
The boundaries of the tree are what a caller outside a folder reaches through its surface: a use case, an adapter, a delivery unit, a reusable component, a lib, and a module of pure rules of the domain; composition and the wiring get no spec.

| Why | Tags |
|---|---|
| each of these is a unit another part of the program relies on, and what sits behind a surface is proven through it. | [testing] |
