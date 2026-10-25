import { describe, expect, it } from 'bun:test';

import { columnWidthsOf, padTo, shareOf, widthOf } from '../layout.utils';
import { ColumnAlign } from '../text.constants';

describe('widthOf', () => {
  it('should count a wide character as two cells and a colour code as none', () => {
    // Arrange
    // biome-ignore lint/security/noSecrets: the escape codes of a terminal's colours, no secret
    const text = '\u001B[31m日本\u001B[39m';

    // Act
    const width = widthOf(text);

    // Assert
    expect(width).toBe(4);
  });
});

describe('padTo', () => {
  it.each([
    {
      align: undefined,
      padded: 'ab   ',
    },
    {
      align: ColumnAlign.Start,
      padded: 'ab   ',
    },
    {
      align: ColumnAlign.End,
      padded: '   ab',
    },
  ])('should pad on the side away from $align', ({ align, padded }) => {
    // Arrange
    const input = {
      align,
      text: 'ab',
      width: 5,
    };

    // Act
    const result = padTo(input);

    // Assert
    expect(result).toBe(padded);
  });

  it('should leave a text wider than its column as it is', () => {
    // Arrange
    const input = {
      text: 'abcdef',
      width: 3,
    };

    // Act
    const result = padTo(input);

    // Assert
    expect(result).toBe('abcdef');
  });
});

describe('columnWidthsOf', () => {
  it('should make each column as wide as its title or its widest cell', () => {
    // Arrange
    const table = {
      columns: [
        {
          key: 'name',
          title: 'Name',
        },
        {
          key: 'kind',
          title: 'K',
        },
      ],
      rows: [
        {
          kind: 'block',
          name: 'ink',
        },
        {
          name: 'commander',
        },
      ],
    };

    // Act
    const widths = columnWidthsOf(table);

    // Assert
    expect(widths).toStrictEqual([
      9,
      5,
    ]);
  });
});

describe('shareOf', () => {
  it.each([
    {
      done: 0,
      total: 0,
      share: {
        filledCells: 0,
        percent: 0,
      },
    },
    {
      done: 1,
      total: 3,
      share: {
        filledCells: 7,
        percent: 33,
      },
    },
    {
      done: 5,
      total: 4,
      share: {
        filledCells: 20,
        percent: 100,
      },
    },
    {
      done: -1,
      total: 4,
      share: {
        filledCells: 0,
        percent: 0,
      },
    },
  ])('should give $done of $total as $share.percent%', ({ done, share, total }) => {
    // Arrange
    const progress = {
      done,
      total,
    };

    // Act
    const result = shareOf(progress);

    // Assert
    expect(result).toStrictEqual(share);
  });
});
