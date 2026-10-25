import { StepStatus } from '@droneey/design-cli';
import { Command } from 'commander';

import type { ProjectWarning } from '#/kernel/entities';
import type { CommandContext } from '#/shared/cli';

import { presetsOutcomeOf, presetsSectionsOf } from '../../../utils';

// Stryker disable ArrayDeclaration,StringLiteral: help text commander prints; no caller relies on it
const DESCRIPTION =
  "Check the project's constitution.yaml, and that its tools' configurations take every part of its blocks' presets.";
const EXAMPLES: readonly string[] = [
  'constitution presets check',
] as const;
// Stryker restore ArrayDeclaration,StringLiteral

interface PresetsCheckContext extends CommandContext {
  readonly checkPresets: (start: string) => readonly ProjectWarning[] | undefined;
}

const createPresetsCheckCommand = (context: PresetsCheckContext): Command =>
  context.withExamples(
    new Command('check').description(DESCRIPTION).action(async (): Promise<void> => {
      const warnings = await context.renderer.run({
        label: 'Presets',
        outcomeOf: (checked: readonly ProjectWarning[] | undefined) =>
          presetsOutcomeOf(checked, StepStatus.Failed),
        run: () => context.checkPresets(context.places.cwd),
      });

      await context.renderer.print(presetsSectionsOf(warnings));

      if (warnings === undefined || warnings.length > 0) {
        context.setFailed();
      }
    }),
    EXAMPLES,
  );

export { createPresetsCheckCommand };
