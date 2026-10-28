import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { ColumnAlign } from '#/libs/ui';

import { frameOf } from '../../../__tests__/ink.fixtures';
import { Table } from '../table';

describe('Table', () => {
  it('should line up each column, a column of numbers to the end, as the golden file shows it', async () => {
    // Act
    const golden = goldenOf({
      'a column of text and a column of numbers': frameOf(
        <Table
          table={{
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
          }}
        />,
      ),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('table.golden.txt', import.meta.url)));
  });
});
