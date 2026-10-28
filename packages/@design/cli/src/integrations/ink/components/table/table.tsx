import type { ReactElement } from 'react';

import type { BoxProps } from 'ink';
import { Box, Text } from 'ink';

import type { TableContent } from '#/libs/ui';
import { ColumnAlign, columnWidthsOf, Space } from '#/libs/ui';

import { useTheme } from '../../theme';

interface TableProps {
  readonly table: TableContent;
}

const justifyOf = (align: ColumnAlign | undefined): BoxProps['justifyContent'] =>
  // Stryker disable next-line StringLiteral: a box keeps to its start unless told otherwise
  align === ColumnAlign.End ? 'flex-end' : 'flex-start';

function Table({ table }: TableProps): ReactElement {
  const theme = useTheme();
  const columnWidths = columnWidthsOf(table);

  const lineOf = (
    cellOf: (columnKey: string, title: string) => string,
    lineKey: string,
  ): ReactElement => (
    <Box
      gap={theme.space[Space.Sm]}
      key={lineKey}
    >
      {table.columns.map((column, index) => (
        <Box
          justifyContent={justifyOf(column.align)}
          key={column.key}
          width={columnWidths[index]}
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
        lineOf((_columnKey, title) => theme.strong(title), 'titles')
      }
      {
        // Why: a row has no identity of its own, and a frame never reorders its rows.
        // Stryker disable next-line StringLiteral: a key only names a line to React, which draws the same with any
        table.rows.map((row, index) => lineOf((columnKey) => row[columnKey] ?? '', `row-${index}`))
      }
    </Box>
  );
}

export type { TableProps };
export { Table };
