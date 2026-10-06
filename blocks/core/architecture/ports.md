# Ports

> Governs a contract at a boundary and the adapter that implements it.

## Contracts

### contract-declared-by-the-layer-that-needs-it · MUST
A contract is declared by the inner layer that needs it, in that layer’s words, and implemented by the outer one; both depend on the contract, never the inner layer on the implementation.

| Why | Tags |
|---|---|
| the business rules choose what they need, and a vendor or an engine is replaced without touching them. | [] |

### port-justified-by-its-boundary · SHOULD
A port at a boundary with something outside — a vendor, an engine, a transport, a format, the clock — is justified by the boundary alone: a port with one adapter is complete, not premature.

| Why | Tags |
|---|---|
| the seam at a real boundary is where change arrives, whether or not a second implementation ever does. | [] |

### contract-knows-no-vendor · MUST
A contract — a port, its parameters and results — imports no vendor, no adapter, no other feature and no other contract’s internals; it speaks only the domain’s types.

| Why | Tags |
|---|---|
| a contract that knows a vendor ties every implementation, and the domain that declares it, to that vendor. | [] |

### feature-asks-another-through-its-own-contract · MUST
A feature that needs an answer from another declares a contract in its own words and receives an input built for it; composition implements the contract through the other feature’s surface.

| Why | Tags |
|---|---|
| the feature stays blind to the other, and the other can change its model without breaking it. | [] |

### data-port-one-per-entity-and-side · MUST
A data port is a repository per entity and per side, one for reads and one for writes, each declaring its operations’ parameters and results; nothing joins the two sides, and a shape both sides use is an entity.

| Why | Tags |
|---|---|
| reads and writes change apart, and a caller that only reads cannot reach a write. | [] |

## Adapters

### outside-shape-mapped-in-the-adapter · MUST
An outside shape — a response, a row, a message, a file format — is mapped to the inner model in the adapter, in both directions, its spellings of absence included; a wire shape never travels inward.

| Why | Tags |
|---|---|
| a vendor’s shape inside the domain turns every change of the vendor into a change of the business rules. | [data] |

### adapter-imports-only-its-contracts-and-shared-layers · MUST
An adapter imports its contracts, the kernel, shared and libs, never an application layer, the delivery layer or another adapter; what two adapters share lives in libs, or in shared when it knows the program.

| Why | Tags |
|---|---|
| adapters that know each other or their callers form a hidden second program beside the domain. | [] |

### adapter-one-per-system-and-owner · SHOULD
An adapter implements, over one outside system, every contract of its owner that system serves, and lives beside that owner; there is never one per method.

| Why | Tags |
|---|---|
| one system’s knowledge — its client, its errors, its wire shapes — is then in one place. | [] |

### adapter-built-by-factory-object-or-class · SHOULD
An adapter is a factory, a module object for one with no dependency, or a class whose constructor takes its dependencies.

| Why | Tags |
|---|---|
| each form builds the adapter in one signature that names what it takes. | [] |

### schema-derived-from-the-domain · MUST
A schema over a domain type or enumeration derives its values from it, so the edge depends on the domain and never restates it.

| Why | Tags |
|---|---|
| a schema that restates the domain drifts from it. | [] |
