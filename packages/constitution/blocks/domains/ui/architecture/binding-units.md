# Binding units

> Governs a binding unit and what each layer of the interface imports.

## General

### binding-unit-composes-its-operation → binding-unit-calls-only-use-cases · MUST

A binding unit binds one operation: it takes the operation's use case from the providers and calls it.

| Why | Tags |
|---|---|
| each operation is bound once, and the screen never learns which adapter serves it. | [] |

### binding-unit-imports-nothing-of-the-ui · MUST

A binding unit imports nothing of `ui/`, which imports it.

| Why | Tags |
|---|---|
| a binding unit that imports the interface forms a cycle with it. | [] |

### binding-units-consumed-by-screens-and-widgets · MUST

Within the interface, binding units are consumed by screens and widgets only, never by a component, and a widget works wherever it is placed.

| Why | Tags |
|---|---|
| a component that reaches no binding unit renders anything its caller hands it, and a widget that needs no screen's data goes anywhere. | [] |

### ui-layer-imports-only-what-its-feature-offers → import-points-inward · MUST

A feature's `ui/` imports `libs/ui`, `shared/ui`, its own binding units, its entities and value objects — their types, enumerations, checks and functions — its errors' codes and the kernel save its contracts, never an adapter, a contract — the kernel's included — or a use case of the domain.

| Why | Tags |
|---|---|
| the interface then depends on what the feature offers, not on how it works, and a change of adapter never reaches a screen. | [] |
