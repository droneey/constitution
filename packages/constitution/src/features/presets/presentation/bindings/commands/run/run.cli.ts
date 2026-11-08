import { Argument, Command, InvalidArgumentError } from 'commander';

import { AbsolutePath } from '#/kernel/value-objects';
import type { CommandContext, StepReport } from '#/shared/cli';

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
      "Run the commands the project's runners give for an entry point: those of the unit around the folder, or every unit's from the root, each unit's in order, stopping at the first that fails.",
    )
    .addArgument(
      // Stryker disable next-line StringLiteral: the argument's name and words show only in the help
      new Argument('<entry>', 'the entry point to run')
        .choices(entryPoints)
        .argParser(entryPointOf),
    )
    .addHelpText(
      'before',
      context.helpExamples([
        'constitution run check',
        'constitution run fix',
      ]),
    )
    .action(async (entryPoint: EntryPoint): Promise<void> => {
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

      await runSteps(
        context,
        context.planRun({
          entryPoint,
          startFolderPath,
        }),
      );
    });

export { createRunCommand };
