# Bindings

> Governs a binding unit and what each layer of the interface imports.

## General

### binding-unit-imports-nothing-of-the-ui · MUST

A binding unit imports no screen, widget or component, which import it.

| Why |
|---|
| a binding unit that imports the interface forms a cycle with it. |

### binding-units-consumed-by-screens-and-widgets · MUST

Within the interface, binding units are consumed by screens and widgets only, never by a component, and a widget works wherever it is placed.

| Why |
|---|
| a component that reaches no binding unit renders anything its caller hands it, and a widget that needs no screen's data goes anywhere. |

### ui-layer-imports-only-what-its-feature-offers → import-points-inward · MUST

A feature's screens, widgets and components import `libs/ui`, `shared/ui`, the feature's own binding units, its entities, aggregates and value objects — their types, enumerations, checks and functions — its errors' codes and the kernel save its contracts, never an adapter, a contract — the kernel's included — or a use case.

| Why |
|---|
| the interface then depends on what the feature offers, not on how it works, and a change of adapter never reaches a screen. |

### rendering-library-imported-by-the-presentation → layer-imports-dependencies-by-its-role · MUST

The library that renders the interface has its home past the edge in the presentation of features and of composition modules: its screens, widgets and components, and the binding units built on the library's hooks.

| Why |
|---|
| the view library is what a component is written in and what a binding unit is built on; every other folder below the edge stays free of it. |
