import { describe, expect, it } from 'bun:test';

import { SourceFailure } from '../../errors';
import { Block } from '../block.entity';
import { failureOf } from './entity.fixtures';

describe('Block.readingOrderOf', () => {
  it('should list the blocks by their names, an abstract one right above the blocks that extend it', () => {
    // Arrange
    const blocks = [
      {
        extends: '_api',
        id: 'rest-api',
      },
      {
        id: 'ui',
      },
      {
        id: '_api',
      },
      {
        extends: '_api',
        id: 'mcp-api',
      },
      {
        id: 'access-control',
      },
      {
        extends: '_api',
        id: 'admin-api',
      },
    ];

    // Act
    const order = Block.readingOrderOf(blocks);

    // Assert
    expect(order).toStrictEqual([
      'access-control',
      '_api',
      'admin-api',
      'mcp-api',
      'rest-api',
      'ui',
    ]);
  });
});

describe('Block.listedChaptersOf', () => {
  it('should give the chapters in the order of the list when it names every chapter once', () => {
    // Arrange
    const chapters = [
      'code',
      'architecture/layers',
    ];

    // Act
    const listed = Block.listedChaptersOf({
      chapters,
      listed: chapters.toReversed(),
    });

    // Assert
    expect(listed).toStrictEqual([
      'architecture/layers',
      'code',
    ]);
  });

  it.each([
    {
      condition: 'leaves a chapter out',
      gaps: {
        missing: [
          'names',
        ],
        repeated: [],
        unknown: [],
      },
      listed: [
        'code',
      ],
    },
    {
      condition: 'names a chapter twice',
      gaps: {
        missing: [],
        repeated: [
          'code',
        ],
        unknown: [],
      },
      listed: [
        'code',
        'names',
        'code',
      ],
    },
    {
      condition: 'names a chapter that is not there',
      gaps: {
        missing: [],
        repeated: [],
        unknown: [
          'types',
        ],
      },
      listed: [
        'code',
        'names',
        'types',
      ],
    },
  ])('should refuse the list, naming its gaps, when it $condition', ({ gaps, listed }) => {
    // Act
    const failure = failureOf(() =>
      Block.listedChaptersOf({
        chapters: [
          'code',
          'names',
        ],
        listed,
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      code: SourceFailure.ChapterListMismatch,
      details: gaps,
    });
  });
});
