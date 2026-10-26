import type { ReactElement } from 'react';

import type { BoxProps } from 'ink';
import { Box, Text } from 'ink';

import { ColumnAlign, columnWidthsOf, Space } from '#/libs/ui';

import { useTheme } from '../../hooks';
import type { TableProps } from './table.types';

const justifyOf = (align: ColumnAlign | undefined): BoxProps['justifyContent'] =>
  // Stryker disable next-line StringLiteral: a box keeps to its start unless told otherwise
  align === ColumnAlign.End ? 'flex-end' : 'flex-start';

function Table({ table }: TableProps): ReactElement {
  const theme = useTheme();
  const widths = columnWidthsOf(table);

  const lineOf = (cellOf: (key: string, title: string) => string, key: string): ReactElement => (
    <Box
      gap={theme.space[Space.Sm]}
      key={key}
    >
      {table.columns.map((column, index) => (
        <Box
          justifyContent={justifyOf(column.align)}
          key={column.key}
          width={widths[index]}
        >
          <Text>{cellOf(column.key, column.title)}</Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      aria-role='table'
      flexDirection='column'
    >
      {
        // Stryker disable next-line StringLiteral: a key only names a line to React, which draws the same with any
        lineOf((_key, title) => theme.strong(title), 'titles')
      }
      {
        // A row has no identity of its own, and a frame never reorders its rows.
        // Stryker disable next-line StringLiteral: a key only names a line to React, which draws the same with any
        table.rows.map((row, index) => lineOf((key) => row[key] ?? '', `row-${index}`))
      }
    </Box>
  );
}

export { Table };
