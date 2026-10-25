import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { columnWidthsOf, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../hooks';
import type { KeyValueListProps } from './key-value-list.types';

function KeyValueList({ pairs }: KeyValueListProps): ReactElement {
  const theme = useTheme();
  const [keyWidth] = columnWidthsOf({
    columns: [
      {
        key: 'key',
        title: '',
      },
    ],
    rows: pairs.map(([key]) => ({
      key,
    })),
  });

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

export { KeyValueList };
