# Layout

> Governs a package's tree in TypeScript: how its surfaces are imported, and its role suffixes.

## Surfaces

### surface-imported-by-its-folders-path → module-reached-only-through-its-surface · MUST

Every import of a surface ends at its folder, never at its `index` or a file below it. It names the folder, as `…/features/<feature>` or `…/kernel/errors` do. Exempt: code that a runtime mapping no folder to its surface loads without a bundler, whose import ends at the surface's file.

#### Why

An import that ends at `index` or at a file below it hides whether it went through the door, so a breach of the surface reads like any other import.

#### Examples

```ts title="Avoid"
// src/root/orders.ts
import { createCancelOrder } from '../features/orders/index';
import { AppError } from '../kernel/errors/app.error';
```

```ts title="Prefer"
// src/root/orders.ts
import { createCancelOrder } from '../features/orders';
import { AppError } from '../kernel/errors';
```

## Names

### role-suffix-spelled-after-a-dot → file-carries-its-role-suffix · MUST

Every role file is named `<name>.<role>.ts`, or `<name>.<role>.tsx` where it writes markup. Its role is spelled after a dot.

#### Why

A role joined to a kebab-case name by a hyphen reads as one more word of that name, so neither a reader nor a tool can tell the role apart from it.

#### Examples

```text title="Avoid"
src/features/orders/application/
├── contracts/
│   └── order-repository-port.ts
└── use-cases/commands/
    └── cancel-order-use-case.ts
```

```text title="Prefer"
src/features/orders/application/
├── contracts/
│   └── order-repository.port.ts
└── use-cases/commands/
    └── cancel-order.use-case.ts
```
