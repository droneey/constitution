import { StepStatus, Tone } from '@droneey/design-cli';

import type { Section, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection } from '#/shared/cli';

import type { Validation } from '../../domain/use-cases/queries/check';

const FINDING = 'finding';

const blocksOutcomeOf = (validation: Validation | undefined): TaskOutcome => {
  if (validation === undefined) {
    return {
      detail: 'no blocks in this folder',
      status: StepStatus.Skipped,
    };
  }

  const count = validation.findings.length;

  return count === 0
    ? {
        detail: 'every block is sound',
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

// Each finding closes with its code, as a linter's rule id does.
const blocksSectionsOf = (validation: Validation | undefined): readonly Section[] => [
  ...(validation === undefined || validation.findings.length === 0
    ? []
    : [
        noteSection({
          lines: validation.findings.map(
            (finding) => `${finding.path}: ${finding.message} [${finding.code}]`,
          ),
          title: `${countOf({
            count: validation.findings.length,
            noun: FINDING,
          })} in the blocks`,
          tone: Tone.Error,
        }),
      ]),
  ...(validation === undefined || validation.advice.length === 0
    ? []
    : [
        noteSection({
          lines: validation.advice,
          title: 'Advice on the blocks',
          tone: Tone.Info,
        }),
      ]),
];

export { blocksOutcomeOf, blocksSectionsOf };
