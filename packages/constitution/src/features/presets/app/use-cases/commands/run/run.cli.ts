import { Argument, Command } from 'commander';

import type { CommandContext } from '#/shared/cli';

import type { RunAsked, RunPlan } from '../../../../domain/entities';
import type { RunStepsContext } from '../../../utils';
import { runSteps } from '../../../utils';

interface RunContext extends CommandContext, RunStepsContext {
  readonly planRun: (input: RunAsked) => RunPlan;
}

const ENTRIES = [
  'check',
  'test',
  'fix',
] as const;

/** Runs from the folder it starts in: a member's own commands there, every unit's from the root. */
const createRunCommand = (context: RunContext): Command =>
  new Command('run')
    .description(
      "Run the commands the project's runners give for an entry point: those of the unit around the folder, or every unit's from the root, each unit's in order, stopping at the first that fails.",
    )
    .addArgument(
      // Stryker disable next-line StringLiteral: the argument's name and words show only in the help
      new Argument('<entry>', 'the entry point to run').choices([
        ...ENTRIES,
      ]),
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution run check',
        'constitution run fix',
      ]),
    )
    .action((entry: string): void => {
      runSteps(
        context,
        context.planRun({
          name: entry,
          start: context.places.cwd,
        }),
      );
    });

export { createRunCommand };
