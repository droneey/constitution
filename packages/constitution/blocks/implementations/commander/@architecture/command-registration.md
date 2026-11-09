# Command registration

> Governs a subcommand's file and how the root adds it to the program.

## General

### commander-subcommand-built-as-a-command → subcommand-built-by-a-factory-the-root-calls · MUST

Every subcommand's factory returns a `Command` with its description, options and action.

#### Why

A subcommand whose options or action are added outside its factory is built in two places, so its file no longer shows what it takes and what it does.

#### Examples

```ts title="Avoid"
// src/root/program.ts
program
  .addCommand(createRefundCommand(dependencies).copyInheritedSettings(program))
  .commands.at(-1)
  ?.requiredOption('-o, --order <id>', 'the order to refund');
```

```ts title="Prefer"
// src/features/orders/presentation/bindings/commands/refund-order.ts
export const createRefundCommand = ({ refundOrder }: RefundDependencies): Command =>
  new Command('refund')
    .description('Refund a paid order')
    .requiredOption('-o, --order <id>', 'the order to refund')
    .action(async (_options, command: Command) => {
      const { order } = parseRefundOptions(command.opts());
      await refundOrder({ orderId: order });
    });
```

### commander-subcommand-registered-with-add-command → delivery-unit-registered-by-the-root · MUST

The root registers every subcommand it built with `addCommand` on the program, never as a stand-alone executable commander searches a folder for.

#### Why

A subcommand the root did not register is missing from the one list of what the program answers, and a stand-alone executable is found by its file's name beside the entry script, by a search no file lists (commander's readme).

#### Examples

```ts title="Avoid"
// src/root/program.ts
program.command('refund', 'Refund a paid order', { executableFile: 'shop-refund' });
```

```ts title="Prefer"
// src/root/program.ts
program.addCommand(createRefundCommand(dependencies).copyInheritedSettings(program));
```
