import { StepStatus, Tone } from '@droneey/design-cli';

import { ProjectWarning } from '#/kernel/entities';
import type { Section, StepReport, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection, warningTextOf } from '#/shared/cli';

import type { ConfigurationsCheck } from '../../domain/entities';
import { findingLinesOf } from './presets-findings-report.utils';

const WARNING = 'warning';
const FINDING = 'finding';

const countIn = (check: ConfigurationsCheck): number =>
  check.warnings.length + check.findings.length;

/** An undefined check found no project. */
const configurationsOutcomeOf = (
  check: ConfigurationsCheck | undefined,
  statusWithoutProject: StepStatus = StepStatus.Skipped,
): TaskOutcome => {
  if (check === undefined) {
    return {
      detail: 'no constitution.yaml in this folder or above it',
      status: statusWithoutProject,
    };
  }

  return countIn(check) === 0
    ? {
        detail: 'constitution.yaml and its configurations are sound',
        status: StepStatus.Done,
      }
    : {
        detail: [
          check.warnings.length === 0
            ? []
            : [
                countOf({
                  count: check.warnings.length,
                  noun: WARNING,
                }),
              ],
          check.findings.length === 0
            ? []
            : [
                countOf({
                  count: check.findings.length,
                  noun: FINDING,
                }),
              ],
        ]
          .flat()
          .join(', '),
        status: StepStatus.Warned,
      };
};

const configurationsSectionsOf = (check: ConfigurationsCheck | undefined): readonly Section[] => [
  ...(check === undefined || check.warnings.length === 0
    ? []
    : [
        noteSection({
          lines: check.warnings.map(
            (warning) => `${ProjectWarning.codeOf(warning)}: ${warningTextOf(warning)}`,
          ),
          title: `${countOf({
            count: check.warnings.length,
            noun: WARNING,
          })} in the project`,
          tone: Tone.Warning,
        }),
      ]),
  ...(check === undefined || check.findings.length === 0
    ? []
    : [
        noteSection({
          lines: findingLinesOf(check.findings),
          title: `${countOf({
            count: check.findings.length,
            noun: FINDING,
          })} in the configurations`,
          tone: Tone.Warning,
        }),
      ]),
];

const configurationsStepOf = (check: ConfigurationsCheck | undefined): StepReport => ({
  isFailed: check !== undefined && countIn(check) > 0,
  outcome: configurationsOutcomeOf(check),
  sections: configurationsSectionsOf(check),
});

export { configurationsOutcomeOf, configurationsSectionsOf, configurationsStepOf };
