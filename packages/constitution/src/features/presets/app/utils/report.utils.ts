import { StepStatus, Tone } from '@droneey/design-cli';

import type { ProjectWarning } from '#/kernel/entities';
import type { Section, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection } from '#/shared/cli';

const WARNING = 'warning';

const presetsOutcomeOf = (warnings: readonly ProjectWarning[] | undefined): TaskOutcome => {
  if (warnings === undefined) {
    return {
      detail: 'no constitution.yaml in this folder or above it',
      status: StepStatus.Skipped,
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
          lines: warnings.map((warning) => `${warning.code}: ${warning.message}`),
          title: `${countOf({
            count: warnings.length,
            noun: WARNING,
          })} in the project`,
          tone: Tone.Warning,
        }),
      ];

export { presetsOutcomeOf, presetsSectionsOf };
