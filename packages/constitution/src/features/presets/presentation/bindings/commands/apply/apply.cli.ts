import { Command } from 'commander';
import { z } from 'zod';

import { AbsolutePath } from '#/kernel/value-objects';
import type { OptionDeclaration } from '#/libs/commander';
import { withOption } from '#/libs/commander';
import type { CommandContext } from '#/shared/cli';
import { flagsOf, folderPathOf } from '#/shared/cli';

import type {
  AppliedFiles,
  ApplyPlan,
  ProjectRead,
  RunAsked,
  RunPlan,
} from '../../../../domain/entities';
import { ApplyPlanKind, EntryPoint, ProjectReadStatus } from '../../../../domain/entities';
import type { RunStepsContext } from '../../../utils';
import { applyOutcomeOf, applySectionsOf, runSteps } from '../../../utils';

interface PresetsApplyContext extends CommandContext, RunStepsContext {
  /** @throws {ApplyError} when a file cannot be written, which leaves every file as it was */
  readonly applyChanges: (changes: AppliedFiles) => void;
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly planApply: (startFolderPath: AbsolutePath) => ProjectRead<ApplyPlan>;
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly planRun: (input: RunAsked) => ProjectRead<RunPlan>;
}

const NO_FIX_FLAG = {
  // Stryker disable next-line StringLiteral: help text commander prints; no caller relies on it
  description: 'leave the files as written, running no fix',
  flags: '--no-fix',
} as const satisfies OptionDeclaration;

const applyFlagsSchema = z.strictObject({
  fix: z.boolean(),
});

const createPresetsApplyCommand = (context: PresetsApplyContext): Command =>
  withOption({
    command: new Command('apply')
      .description(
        "Write what the presets compute for the project's blocks into its tools' configurations, beside its own settings, and keep each unit's constitution.lock; then run the fix of each unit it wrote a file of.",
      )
      .addHelpText(
        'before',
        context.helpExamples([
          'constitution presets apply',
          'constitution presets apply --no-fix',
        ]),
      ),
    option: NO_FIX_FLAG,
    /** @throws {UsageError} when the options do not parse */
    parse: (opts) =>
      flagsOf({
        opts,
        schema: applyFlagsSchema,
      }),
    /**
     * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
     * @throws {ReleaseError} when the release's blocks cannot be listed
     */
    run: async ({ fix }): Promise<void> => {
      const { places } = context;
      const startFolderPath = folderPathOf({
        from: AbsolutePath.create(places.cwd),
        given: places.projectDir ?? places.cwd,
      });
      const read = await context.renderer.run({
        label: 'Presets',
        outcomeOf: applyOutcomeOf,
        /**
         * @throws {ApplyError} when a file cannot be written, which leaves every file as it was
         * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
         * @throws {ReleaseError} when the release's blocks cannot be listed
         */
        run: () => {
          const planned = context.planApply(startFolderPath);

          if (
            planned.status === ProjectReadStatus.Opened &&
            planned.answer.kind === ApplyPlanKind.Ready
          ) {
            context.applyChanges(planned.answer.changes);
          }

          return planned;
        },
      });

      await context.renderer.print(applySectionsOf(read));

      if (read.status !== ProjectReadStatus.Opened || read.answer.kind === ApplyPlanKind.Held) {
        context.setFailed();

        return;
      }

      if (fix && read.answer.report.writtenUnitPaths.length > 0) {
        await runSteps(
          context,
          context.planRun({
            entryPoint: EntryPoint.Fix,
            startFolderPath,
            unitPaths: read.answer.report.writtenUnitPaths,
          }),
        );
      }
    },
  });

export { createPresetsApplyCommand };
