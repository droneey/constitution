# Layers

> Governs the layers of a command-line program: where its command-line parser is imported.

## Direction

### command-line-parser-imported-only-by-binding-units → layer-imports-dependencies-by-its-role · MUST

Outside the edge, only the binding units of the program's subcommands import its command-line parser.

#### Why

A parser imported by the domain or its use cases ties them to one command line, so they cannot be reused by another interface or tested without it.

#### Examples

```ts title="Avoid"
// src/features/orders/application/use-cases/commands/import-orders.use-case.ts
import type { OptionValues } from "commander";

export const createImportOrders =
  ({ orderFiles, orderRepository }: ImportOrdersDependencies) =>
  async (options: OptionValues, context: Context): Promise<void> => {
    const orders = await orderFiles.read(options.file, context);
    await orderRepository.saveAll(orders, context);
  };
```

```ts title="Prefer"
// src/features/orders/application/use-cases/commands/import-orders.use-case.ts
export const createImportOrders =
  ({ orderFiles, orderRepository }: ImportOrdersDependencies) =>
  async (input: ImportOrdersInput, context: Context): Promise<void> => {
    const orders = await orderFiles.read(input.file, context);
    await orderRepository.saveAll(orders, context);
  };

// src/features/orders/presentation/bindings/commands/import-orders.ts
import { Command } from "commander";
```
