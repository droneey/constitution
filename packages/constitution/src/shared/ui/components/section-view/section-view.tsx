import type { ReactElement } from 'react';

import { KeyValueList, Note, TaskList } from '@droneey/design-cli/ink';
import { Box } from 'ink';

import type { Section } from '#/shared/cli';
import { SectionKind } from '#/shared/cli';

import { STEP_STATUS_LABELS, TONE_LABELS } from '../../constants';

// What the view draws: every section but lines of data, which are printed as they are.
type DrawnSection = Exclude<
  Section,
  {
    readonly kind: SectionKind.Lines;
  }
>;

interface SectionViewProps {
  readonly section: DrawnSection;
}

const contentOf = (section: DrawnSection): ReactElement => {
  switch (section.kind) {
    case SectionKind.Note:
      return (
        <Note
          note={section.note}
          toneLabel={TONE_LABELS[section.note.tone]}
        />
      );
    case SectionKind.Pairs:
      return <KeyValueList pairs={section.pairs} />;
    case SectionKind.Steps:
      return (
        <TaskList
          statusLabels={STEP_STATUS_LABELS}
          steps={section.steps}
        />
      );
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return section satisfies never;
  }
};

/** a section of a command's result, as wide as what it holds */
function SectionView({ section }: SectionViewProps): ReactElement {
  return <Box alignItems='flex-start'>{contentOf(section)}</Box>;
}

export { SectionView };
