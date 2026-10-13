# Tests

> Governs which units of the tree are a spec's boundaries.

## Boundaries

### spec-boundaries-follow-the-tree · SHOULD
The boundaries of the tree are what a caller outside a folder reaches through its surface: a use case, an adapter, a delivery unit, a reusable unit of the delivery layer, a lib, a module of pure rules of the domain, and a unit of the root other than the wiring; the wiring gets no spec, and composition gets one where it derives a fact or implements a contract.

| Why | Tags |
|---|---|
| each of these is a unit another part of the program relies on, and what sits behind a surface is proven through it. | [testing] |
