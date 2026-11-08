# Root

> Governs how the composition root builds a subcommand's binding unit.

## Assembly

### subcommand-built-by-a-factory-the-root-calls → unit-handed-its-dependencies · SHOULD

Every subcommand's binding unit is built by a factory its file offers, which the composition root calls with what the unit needs. Exempt: a binding unit whose framework's block gives it another form, which the root builds alike.

#### Why

A binding unit that builds what it needs binds itself to the real adapters, so no spec can build it with fakes.

#### Examples

```ts title="Avoid"
// src/features/orders/presentation/bindings/commands/export-orders.ts
export const exportOrdersCommand = new Command("export")
  .option("--status <status>")
  .action(async (options: ExportOrdersOptions) => {
    const exportOrders = createExportOrders({ orderQueries: createPgOrderQueries(pool) });
    output.data(await exportOrders(parseExportOrdersInput(options), runContext()));
  });
```

```ts title="Prefer"
// src/features/orders/presentation/bindings/commands/export-orders.ts
export const createExportOrdersCommand = ({
  exportOrders,
  output,
  context,
}: ExportOrdersCommandDependencies): Command =>
  new Command("export")
    .option("--status <status>")
    .action(async (options: ExportOrdersOptions) => {
      output.data(await exportOrders(parseExportOrdersInput(options), context));
    });

// src/root/orders.ts
program.addCommand(createExportOrdersCommand({ exportOrders, output, context }));
```
