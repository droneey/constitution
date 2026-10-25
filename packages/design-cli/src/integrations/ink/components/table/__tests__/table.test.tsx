import { describe, expect, it } from 'bun:test';

import { ColumnAlign } from '#/libs/ui';

import { renderWithTheme } from '../../../__tests__/ink.fixtures';
import { Table } from '../table';

describe('Table', () => {
  it('should line up each column, a column of numbers to the end', () => {
    // Arrange
    const table = {
      columns: [
        {
          key: 'block',
          title: 'Block',
        },
        {
          align: ColumnAlign.End,
          key: 'rules',
          title: 'Rules',
        },
      ],
      rows: [
        {
          block: 'typescript',
          rules: '42',
        },
        {
          block: 'ink',
        },
      ],
    };

    // Act
    const { lastFrame } = renderWithTheme(<Table table={table} />);

    // Assert
    expect(lastFrame()?.split('\n')).toStrictEqual([
      'Block       Rules',
      'typescript     42',
      'ink',
    ]);
  });
});
