# Commands

> Governs a subcommand's options, the settings it inherits, and a subcommand's spec.

## General

### commander-options-parsed-by-schema → outside-value-untyped-until-parsed · MUST

Every subcommand's options and arguments are parsed by a schema before its work starts. `opts()` is never read as a typed value.

#### Why

Commander types every option as whatever the command line held, so a cast over `opts()` is a promise the user's typing never made — parse, don't validate.

#### Examples

```ts title="Avoid"
export const createRefundCommand = ({ refundOrder }: RefundDependencies): Command =>
  new Command('refund')
    .description('Refund a paid order')
    .requiredOption('-o, --order <id>', 'the order to refund')
    .action(async (_options, command: Command) => {
      const { order } = command.opts<{ order: OrderId }>();
      await refundOrder({ orderId: order });
    });
```

```ts title="Prefer"
export const createRefundCommand = ({ refundOrder }: RefundDependencies): Command =>
  new Command('refund')
    .description('Refund a paid order')
    .requiredOption('-o, --order <id>', 'the order to refund')
    .action(async (_options, command: Command) => {
      const { order } = parseRefundOptions(command.opts());
      await refundOrder({ orderId: order });
    });
```

### commander-settings-copied-to-every-command → shared-resource-has-one-writer · MUST

Every subcommand added with `addCommand` takes the program's settings first. It calls `copyInheritedSettings(program)`, so its output, its exit override and its help are the program's.

#### Why

`addCommand` copies none of the settings `command()` copies, so a subcommand added bare writes its errors to the process's streams and exits on its own (commander's readme).

#### Examples

```ts title="Avoid"
// src/root/program.ts
program.addCommand(createRefundCommand(dependencies));
```

```ts title="Prefer"
// src/root/program.ts
program.addCommand(createRefundCommand(dependencies).copyInheritedSettings(program));
```

## Specs

### commander-spec-through-its-process-hooks → program-tested-through-its-command-line · SHOULD

Every spec of a subcommand runs the program with its output and its exit captured. It builds the program from the root with `configureOutput` writing to the spec's buffers and `exitOverride()` on, and runs it with `parseAsync(args, { from: 'user' })`.

#### Why

A spec without these hooks writes to the process's streams and ends the runner's process on the subcommand's exit, so it reads neither what the user would see nor the code the run ends with.

#### Examples

```ts title="Avoid"
test('should refund the order when its id is given', async () => {
  // Arrange
  const program = createProgram(createFakeShopDependencies());
  // Act
  await program.parseAsync(['node', 'shop', 'refund', '--order', 'order-1']);
  // Assert
  expect(process.exitCode).toBe(0);
});
```

```ts title="Prefer"
test('should refund the order when its id is given', async () => {
  // Arrange
  const output = createOutputBuffers();
  const program = createProgram(createFakeShopDependencies())
    .configureOutput(output.writers)
    .exitOverride();
  // Act
  await program.parseAsync(['refund', '--order', 'order-1'], { from: 'user' });
  // Assert
  expect(output.out()).toBe('Order order-1 refunded\n');
});
```
