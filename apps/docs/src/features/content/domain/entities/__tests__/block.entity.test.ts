import { describe, expect, it } from 'bun:test';

import { Block } from '../block.entity';

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

describe('Block.chapterListGapsOf', () => {
  it('should find no gap when the list names every chapter once', () => {
    // Arrange
    const chapters = [
      'code',
      'architecture/layers',
    ];

    // Act
    const gaps = Block.chapterListGapsOf({
      chapters,
      listed: chapters.toReversed(),
    });

    // Assert
    expect(gaps).toStrictEqual({
      missing: [],
      repeated: [],
      unknown: [],
    });
  });

  it('should name what the list leaves out, repeats and names that is no chapter', () => {
    // Arrange
    const chapters = [
      'code',
      'names',
    ];

    // Act
    const gaps = Block.chapterListGapsOf({
      chapters,
      listed: [
        'code',
        'code',
        'types',
      ],
    });

    // Assert
    expect(gaps).toStrictEqual({
      missing: [
        'names',
      ],
      repeated: [
        'code',
      ],
      unknown: [
        'types',
      ],
    });
  });
});
