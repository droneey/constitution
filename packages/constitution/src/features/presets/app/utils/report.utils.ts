import { StepStatus, Tone } from '@droneey/design-cli';

import { ProjectWarning } from '#/kernel/entities';
import type { Section, StepReport, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection, warningTextOf } from '#/shared/cli';

const WARNING = 'warning';

/** The step's end; one that finds no project ends as statusWithoutProject says, skipped by default. */
const presetsOutcomeOf = (
  warnings: readonly ProjectWarning[] | undefined,
  statusWithoutProject: StepStatus = StepStatus.Skipped,
): TaskOutcome => {
  if (warnings === undefined) {
    return {
      detail: 'no constitution.yaml in this folder or above it',
      status: statusWithoutProject,
    };
  }

  return warnings.length === 0
    ? {
        detail: 'constitution.yaml and its wiring are sound',
        status: StepStatus.Done,
      }
    : {
        detail: countOf({
          count: warnings.length,
          noun: WARNING,
        }),
        status: StepStatus.Warned,
      };
};

const presetsSectionsOf = (warnings: readonly ProjectWarning[] | undefined): readonly Section[] =>
  warnings === undefined || warnings.length === 0
    ? []
    : [
        noteSection({
          lines: warnings.map(
            (warning) => `${ProjectWarning.codeOf(warning)}: ${warningTextOf(warning)}`,
          ),
          title: `${countOf({
            count: warnings.length,
            noun: WARNING,
          })} in the project`,
          tone: Tone.Warning,
        }),
      ];

/** The project's step as the check presents it, failed where it has warnings. */
const presetsStepOf = (warnings: readonly ProjectWarning[] | undefined): StepReport => ({
  isFailed: (warnings?.length ?? 0) > 0,
  outcome: presetsOutcomeOf(warnings),
  sections: presetsSectionsOf(warnings),
});

export { presetsOutcomeOf, presetsSectionsOf, presetsStepOf };
