import { StepStatus, Tone } from '@droneey/design-cli';

import type { Section, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection, reportLinesOf } from '#/shared/cli';

import type { Validation } from '../../domain/services';
import { ValidationStage } from '../../domain/services';
import { findingTextOf } from './finding-text.utils';
import {
  ADVICE_TITLE,
  adviceMessage,
  FINDING,
  findingsTitleMessage,
  SOUND,
} from './report.messages';

const blocksOutcomeOf = (validation: Validation): TaskOutcome => {
  const count = validation.findings.length;

  return count === 0
    ? {
        detail: SOUND,
        status: StepStatus.Done,
      }
    : {
        detail: countOf({
          count,
          noun: FINDING,
        }),
        status: StepStatus.Failed,
      };
};

const blocksSectionsOf = (validation: Validation | undefined): readonly Section[] => [
  ...(validation === undefined || validation.findings.length === 0
    ? []
    : [
        noteSection({
          lines: reportLinesOf({
            findings: validation.findings,
            textOf: findingTextOf,
          }),
          title: findingsTitleMessage(
            countOf({
              count: validation.findings.length,
              noun: FINDING,
            }),
          ),
          tone: Tone.Error,
        }),
      ]),
  ...(validation?.stage !== ValidationStage.Checked || validation.advice.length === 0
    ? []
    : [
        noteSection({
          lines: validation.advice.map(adviceMessage),
          title: ADVICE_TITLE,
          tone: Tone.Info,
        }),
      ]),
];

export { blocksOutcomeOf, blocksSectionsOf };
