import type { OutputFlags } from '@droneey/design-cli';
import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';
import { outputFlagsOf } from '#/shared/cli';

/** The output flags as the design system takes them, each left out where the run gives none. */
const flagsOf = (opts: unknown): OutputFlags => {
  const { color, motion, plain } = outputFlagsOf(opts);

  return {
    ...(color === undefined
      ? {}
      : {
          colour: color,
        }),
    ...(motion === undefined
      ? {}
      : {
          motion,
        }),
    ...(plain === undefined
      ? {}
      : {
          plain,
        }),
  };
};

const adopt = (parent: Command, children: readonly Command[]): Command => {
  for (const child of children) {
    child.copyInheritedSettings(parent);
    parent.addCommand(child);
  }

  return parent;
};

interface GroupInput {
  readonly context: CommandContext;
  readonly description: string;
  readonly examples: readonly string[];
  readonly name: string;
  readonly parent: Command;
}

/** A command that groups others under a name, with the program's settings and its examples. */
const groupOf = (input: GroupInput): Command =>
  new Command(input.name)
    .description(input.description)
    .addHelpText('before', input.context.helpExamples(input.examples))
    .copyInheritedSettings(input.parent);

export { adopt, flagsOf, groupOf };
