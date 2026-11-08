# Subcommands

> Governs a subcommand's flags, the program's configuration and a subcommand's spec.

## General

### bunli-flags-declared-by-schema → outside-value-untyped-until-parsed · MUST

Every flag is declared by a schema. It is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.

#### Why

A flag read raw reaches the handler as whatever the user typed, under a type the input never promised, while a flag declared by its schema is checked once, before the handler runs — parse, don't validate.

#### Examples

```ts title="Avoid"
export const createRefundCommand = ({ refundOrder, lastResort }: RefundDependencies) =>
  defineCommand({
    name: 'refund',
    description: 'Refund a paid order',
    handler: ({ positional }) =>
      lastResort.run(() => refundOrder({ orderId: positional[0] as OrderId })),
  });
```

```ts title="Prefer"
export const createRefundCommand = ({ refundOrder, lastResort }: RefundDependencies) =>
  defineCommand({
    name: 'refund',
    description: 'Refund a paid order',
    options: {
      order: option(orderIdSchema, { short: 'o', description: 'The order to refund' }),
    },
    handler: ({ flags }) => lastResort.run(() => refundOrder({ orderId: flags.order })),
  });
```

### program-keeps-no-bunli-config → fact-has-one-source · MUST

The program keeps no `bunli.config.*`. Its configuration, its name, version, description and plugins, is given to `createCLI` in code.

#### Why

Bunli merges a `bunli.config.*` it finds in the working folder into the configuration given in code, so a file beside the program changes what it ships as much as what a spec run from another folder builds.

#### Examples

```ts title="Avoid"
// bunli.config.ts
export default defineConfig({
  name: 'shop',
  version: '2.4.0',
  description: 'Manage the shop from the terminal',
});
```

```ts title="Prefer"
// src/root/cli.ts
export const createShopCli = () =>
  createCLI({
    name: 'shop',
    version: '2.4.0',
    description: 'Manage the shop from the terminal',
  });
```

### bunli-spec-with-fake-terminal → program-tested-through-its-command-line · SHOULD

Every subcommand's spec runs the program on an argument list, with its terminal and prompt session replaced. It builds the program by `createCLI` with the prompt session and the terminal's information injected through its runtime dependencies, or, for a subcommand that asks nothing, by `createTestCLI` of `@bunli/test`, which captures the output and the exit.

#### Why

A spec that calls the handler alone misses the parsing, the output and the exit a user meets, and one run on the real terminal writes to the runner's streams, where no case reads what the user would see.

#### Examples

```ts title="Avoid"
test('should cancel the order when its id is given', async () => {
  // Arrange
  const dependencies = createFakeOrderDependencies();
  const command = createCancelOrderCommand(dependencies);
  // Act
  await command.handler(createHandlerArgs({ flags: { order: 'order-1' } }));
  // Assert
  expect(dependencies.cancelledOrderIds).toStrictEqual(['order-1']);
});
```

```ts title="Prefer"
test('should cancel the order when its id is given', async () => {
  // Arrange
  const cli = await createTestCLI({
    commands: [createCancelOrderCommand(createFakeOrderDependencies())],
  });
  // Act
  const result = await cli.run(['cancel', '--order', 'order-1']);
  // Assert
  expect([result.exitCode, result.stdout]).toStrictEqual([0, 'Order order-1 cancelled']);
});
```
