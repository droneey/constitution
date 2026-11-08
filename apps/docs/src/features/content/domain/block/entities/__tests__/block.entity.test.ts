import { describe, expect, it } from 'bun:test';

import { failureOf } from '../../../shared/errors/__tests__/program-error.fixtures';
import { SourceFailure } from '../../../source/errors';
import { Axis, Block, BlockFormat } from '../block.entity';

describe('Block.axisOfFolder', () => {
  it.each([
    {
      axis: Axis.Architecture,
      condition: 'the nested format, which marks it',
      folderName: '@architecture',
    },
    {
      axis: Axis.Workflow,
      condition: 'the legacy format',
      folderName: 'workflow',
    },
    {
      axis: undefined,
      condition: "neither format, as a block's folder",
      folderName: 'react-dom',
    },
    {
      axis: undefined,
      condition: 'neither format, marked twice',
      folderName: '@@foundation',
    },
  ])('should name the axis of a folder as $condition names it', ({ axis, folderName }) => {
    // Act
    const folderAxis = Block.axisOfFolder(folderName);

    // Assert
    expect(folderAxis).toBe(axis);
  });
});

describe('Block.axisFoldersAmong', () => {
  it("should give the axis folders among a folder's names, in the axes' order", () => {
    // Act
    const axisFolders = Block.axisFoldersAmong([
      '@workflow',
      'react-dom',
      'react.md',
      '@foundation',
      'architecture',
    ]);

    // Assert
    expect(axisFolders).toStrictEqual([
      '@foundation',
      'architecture',
      '@workflow',
    ]);
  });
});

describe('Block.formatOf', () => {
  it.each([
    {
      condition: 'a folder of them is an axis the nested format marks',
      format: BlockFormat.Nested,
      paths: [
        'domains/people/people.md',
        'domains/people/accounts/@foundation/sign-in.md',
      ],
    },
    {
      condition: 'no folder of them is',
      format: BlockFormat.Legacy,
      paths: [
        'domains/people/people.md',
        'domains/people/foundation/@sign-in.md',
      ],
    },
  ])('should tell the format of the paths when $condition', ({ format, paths }) => {
    // Act
    const pathsFormat = Block.formatOf(paths);

    // Assert
    expect(pathsFormat).toBe(format);
  });
});

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
