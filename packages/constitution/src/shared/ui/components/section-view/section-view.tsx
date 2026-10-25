import type { ReactElement } from 'react';

import { KeyValueList, Note, TaskList } from '@droneey/design-cli/ink';
import { Box } from 'ink';

import { SectionKind } from '#/shared/cli';

import type { SectionViewProps } from './section-view.types';

const contentOf = (section: SectionViewProps['section']): ReactElement => {
  switch (section.kind) {
    case SectionKind.Note:
      return <Note note={section.note} />;
    case SectionKind.Pairs:
      return <KeyValueList pairs={section.pairs} />;
    default:
      return <TaskList steps={section.steps} />;
  }
};

/** a section of a command's result, as wide as what it holds */
function SectionView({ section }: SectionViewProps): ReactElement {
  return <Box alignItems='flex-start'>{contentOf(section)}</Box>;
}

export { SectionView };
