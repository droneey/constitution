import { StepStatus, Tone } from '@droneey/design-cli';

import type { Section, StepReport, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection } from '#/shared/cli';

import type { PresetsFinding } from '../../domain/entities';
import { findingLinesOf } from './presets-findings-report.utils';

const FINDING = 'finding';

/** Skipped where the folder holds no blocks that load. */
const cataloguesOutcomeOf = (findings: readonly PresetsFinding[] | undefined): TaskOutcome => {
  if (findings === undefined) {
    return {
      detail: 'no blocks to check the catalogues against',
      status: StepStatus.Skipped,
    };
  }

  return findings.length === 0
    ? {
        detail: 'every catalogue is sound',
        status: StepStatus.Done,
      }
    : {
        detail: countOf({
          count: findings.length,
          noun: FINDING,
        }),
        status: StepStatus.Failed,
      };
};

const cataloguesSectionsOf = (
  findings: readonly PresetsFinding[] | undefined,
): readonly Section[] =>
  findings === undefined || findings.length === 0
    ? []
    : [
        noteSection({
          lines: findingLinesOf(findings),
          title: `${countOf({
            count: findings.length,
            noun: FINDING,
          })} in the catalogues`,
          tone: Tone.Error,
        }),
      ];

const cataloguesStepOf = (findings: readonly PresetsFinding[] | undefined): StepReport => ({
  isFailed: (findings?.length ?? 0) > 0,
  outcome: cataloguesOutcomeOf(findings),
  sections: cataloguesSectionsOf(findings),
});

export { cataloguesOutcomeOf, cataloguesSectionsOf, cataloguesStepOf };
