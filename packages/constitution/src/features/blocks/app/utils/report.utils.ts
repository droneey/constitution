import { StepStatus, Tone } from '@droneey/design-cli';

import { compareText } from '#/kernel/utils';
import type { Section, TaskOutcome } from '#/shared/cli';
import { countOf, noteSection } from '#/shared/cli';

import type { SimilarRules } from '../../domain/entities';
import type { Validation } from '../../domain/use-cases/queries/check';
import { findingTextOf } from './finding-text.utils';

const FINDING = 'finding';

// The report gives a file's findings of one code in the order of their text, as a reader scans
// them.
const linesOf = (findings: Validation['findings']): readonly string[] =>
  findings
    .map((finding) => ({
      finding,
      text: findingTextOf(finding),
    }))
    .toSorted(
      (left, right) =>
        compareText(left.finding.path, right.finding.path) ||
        compareText(left.finding.code, right.finding.code) ||
        compareText(left.text, right.text),
    )
    .map(({ finding, text }) => `${finding.path}: ${text} [${finding.code}]`);

const adviceOf = ({ left, right }: SimilarRules): string =>
  `similar rules: ${left.slug} (${left.block}) and ${right.slug} (${right.block})`;

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
          lines: linesOf(validation.findings),
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
          lines: validation.advice.map(adviceOf),
          title: 'Advice on the blocks',
          tone: Tone.Info,
        }),
      ]),
];

export { blocksOutcomeOf, blocksSectionsOf };
