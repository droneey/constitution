import type { Command } from 'commander';

interface OptionDeclaration {
  readonly description: string;
  readonly flags: string;
}

interface OptionInput<TFlags> {
  readonly command: Command;
  readonly option: OptionDeclaration;
  readonly parse: (opts: unknown) => TFlags;
  readonly run: (flags: TFlags) => Promise<void>;
}

const withOption = <TFlags>(input: OptionInput<TFlags>): Command =>
  input.command
    .option(input.option.flags, input.option.description)
    .action(async (_options: unknown, command: Command): Promise<void> => {
      await input.run(input.parse(command.opts()));
    });

export type { OptionDeclaration };
export { withOption };
