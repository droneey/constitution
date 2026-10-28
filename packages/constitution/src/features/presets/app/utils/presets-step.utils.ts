import { StepStatus, Tone } from '@droneey/design-cli';

import type { StepReport, TaskOutcome } from '#/shared/cli';
import { countedNoteSections, countOf } from '#/shared/cli';

import type { PresetsFinding } from '../../domain/entities';
import { findingLinesOf } from './finding-lines.utils';
import { FINDING_NOUN, FOUND_IN_PRESETS_AFTER } from './presets-finding-text.messages';
import { NO_BLOCKS, SOUND } from './presets-step.messages';

const checkedOutcomeOf = (findings: readonly PresetsFinding[]): TaskOutcome =>
  findings.length === 0
    ? {
        detail: SOUND,
        status: StepStatus.Done,
      }
    : {
        detail: countOf({
          count: findings.length,
          noun: FINDING_NOUN,
        }),
        status: StepStatus.Failed,
      };

/** The step where the folder holds no blocks that load, so nothing holds the presets. */
const presetsSkippedStep: StepReport = {
  isFailed: false,
  outcome: {
    detail: NO_BLOCKS,
    status: StepStatus.Skipped,
  },
  sections: [],
};

const presetsStepOf = (findings: readonly PresetsFinding[]): StepReport => {
  const outcome = checkedOutcomeOf(findings);

  return {
    isFailed: outcome.status === StepStatus.Failed,
    outcome,
    sections: countedNoteSections({
      after: FOUND_IN_PRESETS_AFTER,
      lines: findingLinesOf(findings),
      noun: FINDING_NOUN,
      tone: Tone.Error,
    }),
  };
};

export { presetsSkippedStep, presetsStepOf };
