# Subcommand registration

> Governs a subcommand's file and how the root registers it.

## General

### bunli-subcommand-from-a-factory → subcommand-built-by-a-factory-the-root-calls · MUST

Every subcommand is built by its factory with `defineCommand`. The factory returns `defineCommand({ name, description, options, handler })`.

#### Why

A subcommand that lacks what bunli needs fails only when it is run.

#### Examples

```ts title="Avoid"
// src/features/orders/presentation/bindings/queries/list-orders.ts
export const createListOrdersCommand = ({ listOrders, output, lastResort }: ListOrdersDependencies) => ({
  name: 'list',
  handler: () => lastResort.run(async () => output.write(formatOrders(await listOrders()))),
});
```

```ts title="Prefer"
// src/features/orders/presentation/bindings/queries/list-orders.ts
export const createListOrdersCommand = ({ listOrders, output, lastResort }: ListOrdersDependencies) =>
  defineCommand({
    name: 'list',
    description: 'List the open orders',
    options: {},
    handler: () => lastResort.run(async () => output.write(formatOrders(await listOrders()))),
  });
```

### bunli-subcommand-registered-with-cli-command → delivery-unit-registered-by-the-root · MUST

The root registers every subcommand with `cli.command` on the program `createCLI` gave it, never through a folder `bunli generate` scans by `commands.directory`.

#### Why

A subcommand the root did not register is missing from the one list of what the program answers, and one the generator finds by scanning a folder is registered as a side effect of importing its generated file, so the root no longer shows what the program answers.

#### Examples

```ts title="Avoid"
// src/root/cli.ts
export const createShopCli = () =>
  createCLI({
    name: 'shop',
    version: '2.4.0',
    description: 'Manage the shop from the terminal',
    commands: { entry: './src/main.ts', directory: './src/commands' },
  });
```

```ts title="Prefer"
// src/root/cli.ts
export const createShopCli = async (dependencies: ShopDependencies) => {
  const cli = await createCLI({
    name: 'shop',
    version: '2.4.0',
    description: 'Manage the shop from the terminal',
  });

  cli.command(createListOrdersCommand(dependencies));
  cli.command(createCancelOrderCommand(dependencies));

  return cli;
};
```
