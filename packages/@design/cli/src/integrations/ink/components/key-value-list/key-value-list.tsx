import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import type { KeyValue } from '#/libs/ui';
import { keyWidthOf, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../theme';

interface KeyValueListProps {
  /** the pairs, each named by its own key */
  readonly pairs: readonly KeyValue[];
}

function KeyValueList({ pairs }: KeyValueListProps): ReactElement {
  const theme = useTheme();
  const keyWidth = keyWidthOf(pairs);

  return (
    <Box flexDirection='column'>
      {pairs.map(([key, shown]) => (
        <Box
          gap={theme.space[Space.Sm]}
          key={key}
        >
          <Box width={keyWidth}>
            <Text>{theme.paint(Tone.Muted, key)}</Text>
          </Box>
          <Text>{shown}</Text>
        </Box>
      ))}
    </Box>
  );
}

export type { KeyValueListProps };
export { KeyValueList };
