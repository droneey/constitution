import { describe, expect, it } from 'bun:test';

import { ColumnAlign } from '../../constants';
import { padTo, shareOf, widthOf } from '../layout.utils';

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
      alignment: {},
      name: 'the start, when it names no side',
      padded: 'ab   ',
    },
    {
      alignment: {
        align: ColumnAlign.Start,
      },
      name: 'the start',
      padded: 'ab   ',
    },
    {
      alignment: {
        align: ColumnAlign.End,
      },
      name: 'the end',
      padded: '   ab',
    },
  ])('should pad on the side away from $name', ({ alignment, padded }) => {
    // Arrange
    const input = {
      ...alignment,
      text: 'ab',
      width: 5,
    };

    // Act
    const paddedText = padTo(input);

    // Assert
    expect(paddedText).toBe(padded);
  });

  it('should leave a text wider than its column as it is', () => {
    // Arrange
    const input = {
      text: 'abcdef',
      width: 3,
    };

    // Act
    const paddedText = padTo(input);

    // Assert
    expect(paddedText).toBe('abcdef');
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
    const filledShare = shareOf(progress);

    // Assert
    expect(filledShare).toStrictEqual(share);
  });
});
