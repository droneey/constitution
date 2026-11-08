import { describe, expect, it } from 'bun:test';

import { cellsOf, isTableLine, tablesOf } from '../tables.utils';

describe('cellsOf', () => {
  it.each([
    {
      cells: [
        'Why',
      ],
      line: '| Why |',
      name: 'one cell',
    },
    {
      cells: [
        'a',
        'b',
      ],
      line: '|a|b|',
      name: 'two cells without spaces',
    },
    {
      cells: [
        'reads `a | b` as one value',
      ],
      line: '| reads `a \\| b` as one value |',
      name: 'an escaped pipe, which stays in its cell as a pipe',
    },
    {
      cells: [
        'x|',
        'y',
      ],
      line: '| x\\| | y |',
      name: 'an escaped pipe at the end of a cell',
    },
  ])('should read the cells of $name', ({ cells, line }) => {
    // Act
    const read = cellsOf(line);

    // Assert
    expect(read).toStrictEqual(cells);
  });
});

describe('isTableLine', () => {
  it.each([
    {
      expected: true,
      line: '| a |',
    },
    {
      expected: false,
      line: 'a | b',
    },
  ])('should say $expected for "$line"', ({ expected, line }) => {
    // Act
    const isTable = isTableLine(line);

    // Assert
    expect(isTable).toBe(expected);
  });
});

describe('tablesOf', () => {
  it('should split the lines into one table per run of table lines', () => {
    // Arrange
    const lines = [
      '| a |',
      '|---|',
      'text',
      '| b \\| c |',
    ];

    // Act
    const tables = tablesOf(lines);

    // Assert
    expect(tables).toStrictEqual([
      [
        '| a |',
        '|---|',
      ],
      [
        '| b \\| c |',
      ],
    ]);
  });
});
