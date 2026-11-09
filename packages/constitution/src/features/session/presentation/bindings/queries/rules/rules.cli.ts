import { Command } from 'commander';
import { z } from 'zod';

import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext } from '#/shared/cli';
import { flagsOf, folderPathOf, LIST_SEPARATOR } from '#/shared/cli';

import type { GoverningRules } from '../../../../application/use-cases/queries/read-rules';
import { OwedReading } from '../../../../domain/gate/entities';
import { causeLinesOf } from '../../../utils';
import { NO_RULES_MESSAGE, outsideMessage, unreadRulesMessage } from './rules.messages';

interface ReadingAsked {
  readonly reading: OwedReading;
  readonly withWhy: boolean;
}

interface RulesContext extends CommandContext {
  readonly readRules: (paths: readonly AbsolutePath[]) => GoverningRules;
  readonly textOf: (asked: ReadingAsked) => string;
}

const rulesFlagsSchema = z.strictObject({
  for: z.array(z.string()),
  why: z.boolean().optional(),
});

const createRulesCommand = (context: RulesContext): Command =>
  new Command('rules')
    .description(
      "Print what governs the given files: each governing chapter's vocabulary, then each rule's statement at the level that binds there, MUST before SHOULD.",
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution rules --for src/main.ts',
        'constitution rules --for src/main.ts README.md --why',
      ]),
    )
    .requiredOption('--for <files...>', 'the files whose rules to print')
    .option('--why', "print each rule's Why under its statement")
    .action((_options: unknown, command: Command): void => {
      const flags = flagsOf({
        opts: command.opts(),
        schema: rulesFlagsSchema,
      });
      const governing = context.readRules(
        flags.for.map((given) =>
          folderPathOf({
            from: AbsolutePath.create(context.places.cwd),
            given,
          }),
        ),
      );

      if (governing.causes.length > 0) {
        context.io.writeError(`${unreadRulesMessage(causeLinesOf(governing.causes))}\n`);
        context.setFailed();

        return;
      }

      if (governing.outside.length > 0) {
        context.io.writeError(`${outsideMessage(governing.outside.join(LIST_SEPARATOR))}\n`);
        context.setFailed();
      }

      context.io.write(
        `${
          OwedReading.isEmpty(governing.reading)
            ? NO_RULES_MESSAGE
            : context.textOf({
                reading: governing.reading,
                withWhy: flags.why === true,
              })
        }\n`,
      );
    });

export { createRulesCommand };
