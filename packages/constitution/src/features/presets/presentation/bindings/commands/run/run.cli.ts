import { Argument, Command, InvalidArgumentError } from 'commander';
import { z } from 'zod';

import { AbsolutePath } from '#/kernel/value-objects';
import type { OptionDeclaration } from '#/libs/commander';
import type { CommandContext, StepReport } from '#/shared/cli';
import { flagsOf } from '#/shared/cli';

import type { ProjectRead } from '../../../../domain/presets-project/entities';
import type { RunAsked, RunPlan } from '../../../../domain/run-plan/entities';
import { EntryPoint } from '../../../../domain/run-plan/entities';
import type { RunStepsContext } from '../../../utils';
import { runSteps } from '../../../utils';

interface RunContext extends CommandContext, RunStepsContext {
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly checkPacks: (startFolderPath: AbsolutePath) => StepReport | undefined;
  readonly packsLabel: string;
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly planRun: (input: RunAsked) => ProjectRead<RunPlan>;
}

const entryPoints: readonly EntryPoint[] = Object.values(EntryPoint);

const WHY_FLAG = {
  // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
  description: 'print the Why of each rule a failed command breaks',
  flags: '--why',
} as const satisfies OptionDeclaration;

const runFlagsSchema = z.strictObject({
  why: z.boolean().default(false),
});

/** @throws {UsageError} when the options do not parse */
const runFlagsOf = (opts: unknown): z.output<typeof runFlagsSchema> =>
  flagsOf({
    opts,
    schema: runFlagsSchema,
  });

/** @throws {InvalidArgumentError} when the text names no entry point */
const entryPointOf = (text: string): EntryPoint => {
  const entryPoint = entryPoints.find((known) => known === text);

  if (entryPoint === undefined) {
    throw new InvalidArgumentError(`Allowed choices are ${entryPoints.join(', ')}.`);
  }

  return entryPoint;
};

const createRunCommand = (context: RunContext): Command =>
  new Command('run')
    .description(
      "Run the commands the project's runners give for an entry point: those of the unit around the folder, or every unit's from the root, each unit's in order, stopping at the first that fails and naming each rule its output shows broken.",
    )
    .addArgument(
      // Stryker disable next-line StringLiteral: the argument's name and words show only in the help
      new Argument('<entry>', 'the entry point to run')
        .choices(entryPoints)
        .argParser(entryPointOf),
    )
    .option(WHY_FLAG.flags, WHY_FLAG.description)
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution run check',
        'constitution run check --why',
        'constitution run fix',
      ]),
    )
    .action(async (entryPoint: EntryPoint, opts: unknown): Promise<void> => {
      const { why } = runFlagsOf(opts);
      const startFolderPath = AbsolutePath.create(context.places.cwd);
      const packs =
        entryPoint === EntryPoint.Check ? context.checkPacks(startFolderPath) : undefined;

      if (packs !== undefined) {
        await context.renderer.run({
          label: context.packsLabel,
          outcomeOf: (report: StepReport) => report.outcome,
          run: () => packs,
        });
        await context.renderer.print(packs.sections);
      }

      if (packs?.isFailed === true) {
        context.setFailed();

        return;
      }

      await runSteps(context, {
        isWhyShown: why,
        read: context.planRun({
          entryPoint,
          startFolderPath,
        }),
      });
    });

export { createRunCommand };
