import type { Command } from 'commander';

/** An option as commander declares it: its flags, such as `--base <folder>`, and its help text. */
interface OptionDeclaration {
  readonly description: string;
  readonly flags: string;
}

interface OptionInput<TFlags> {
  readonly command: Command;
  readonly option: OptionDeclaration;
  /** the options commander read, as the command takes them */
  readonly parse: (opts: unknown) => TFlags;
  readonly run: (flags: TFlags) => Promise<void>;
}

/** The command given the option, its action run with the options it read, parsed. */
const withOption = <TFlags>(input: OptionInput<TFlags>): Command =>
  input.command
    .option(input.option.flags, input.option.description)
    .action(async (_options: unknown, command: Command): Promise<void> => {
      await input.run(input.parse(command.opts()));
    });

export type { OptionDeclaration };
export { withOption };
