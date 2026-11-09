# Imports

> Governs where a library that parses against a schema is imported.

## General

### schema-library-home-is-where-input-is-parsed → layer-imports-dependencies-by-its-role · MUST

Every library that parses against a schema is imported only where the program parses outside input. Outside the edge, its homes are the presentation of a feature, of a composition module or of the program, where a request's or a form's input is checked, and the top-level shared code that parses; no other folder imports it.

#### Why

A schema inside the domain ties the business types to a parsing library, and runs its checks again on data the edge has already parsed — the dependency rule.

#### Examples

```text title="Avoid"
features/orders/
├── domain/order/value-objects/
│   └── sku.value-object.ts          imports zod
├── application/use-cases/commands/
│   └── place-order.use-case.ts
└── presentation/bindings/commands/
    └── place-order.ts
```

```text title="Prefer"
features/orders/
├── domain/order/value-objects/
│   └── sku.value-object.ts
├── application/use-cases/commands/
│   └── place-order.use-case.ts
└── presentation/bindings/commands/
    └── place-order.ts               imports zod
```
