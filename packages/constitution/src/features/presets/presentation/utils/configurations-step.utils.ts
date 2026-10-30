import { StepStatus, Tone } from '@droneey/design-cli';

import { ProjectWarning } from '#/kernel/entities';
import type { Section, StepReport, TaskOutcome } from '#/shared/cli';
import { countedNoteSections, countOf, LIST_SEPARATOR, warningTextOf } from '#/shared/cli';

import type { ConfigurationsCheck, ProjectRead } from '../../domain/entities';
import { ProjectReadStatus } from '../../domain/entities';
import {
  FINDINGS_AFTER,
  SOUND,
  WARNING_NOUN,
  WARNINGS_AFTER,
  warningLineMessage,
} from './configurations-step.messages';
import { findingLinesOf } from './finding-lines.utils';
import { FINDING_NOUN } from './presets-finding-text.messages';
import { unreadOutcomeOf } from './project-unread.utils';

const countIn = (check: ConfigurationsCheck): number =>
  check.warnings.length + check.findings.length;

const checkedOutcomeOf = (check: ConfigurationsCheck): TaskOutcome =>
  countIn(check) === 0
    ? {
        detail: SOUND,
        status: StepStatus.Done,
      }
    : {
        detail: [
          check.warnings.length === 0
            ? []
            : [
                countOf({
                  count: check.warnings.length,
                  noun: WARNING_NOUN,
                }),
              ],
          check.findings.length === 0
            ? []
            : [
                countOf({
                  count: check.findings.length,
                  noun: FINDING_NOUN,
                }),
              ],
        ]
          .flat()
          .join(LIST_SEPARATOR),
        status: StepStatus.Warned,
      };

const configurationsOutcomeOf = (
  read: ProjectRead<ConfigurationsCheck>,
  statusWithoutProject: StepStatus = StepStatus.Skipped,
): TaskOutcome =>
  read.status === ProjectReadStatus.Opened
    ? checkedOutcomeOf(read.answer)
    : unreadOutcomeOf(read, statusWithoutProject);

const configurationsSectionsOf = (check: ConfigurationsCheck): readonly Section[] => [
  ...countedNoteSections({
    after: WARNINGS_AFTER,
    lines: check.warnings.map((warning) =>
      warningLineMessage({
        code: ProjectWarning.codeOf(warning),
        text: warningTextOf(warning),
      }),
    ),
    noun: WARNING_NOUN,
    tone: Tone.Warning,
  }),
  ...countedNoteSections({
    after: FINDINGS_AFTER,
    lines: findingLinesOf(check.findings),
    noun: FINDING_NOUN,
    tone: Tone.Warning,
  }),
];

const failedStatuses: ReadonlySet<StepStatus> = new Set([
  StepStatus.Failed,
  StepStatus.Warned,
]);

const configurationsStepOf = (
  read: ProjectRead<ConfigurationsCheck>,
  statusWithoutProject: StepStatus = StepStatus.Skipped,
): StepReport => {
  const outcome = configurationsOutcomeOf(read, statusWithoutProject);

  return {
    isFailed: failedStatuses.has(outcome.status),
    outcome,
    sections: read.status === ProjectReadStatus.Opened ? configurationsSectionsOf(read.answer) : [],
  };
};

export { configurationsStepOf };
