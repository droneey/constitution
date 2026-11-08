import { describe, expect, it } from 'bun:test';

import { failureOf } from '../../../shared/errors/__tests__/program-error.fixtures';
import { SourceFailure } from '../../../source/errors';
import { Axis, axisFoldersAmong, axisOfFolder, listedChaptersOf } from '../block.entity';

describe('axisOfFolder', () => {
  it.each([
    {
      axis: Axis.Architecture,
      condition: 'the axis it names, marked by @',
      folderName: '@architecture',
    },
    {
      axis: undefined,
      condition: 'no axis, unmarked',
      folderName: 'workflow',
    },
    {
      axis: undefined,
      condition: "no axis, as a block's folder",
      folderName: 'react-dom',
    },
    {
      axis: undefined,
      condition: 'no axis, marked twice',
      folderName: '@@foundation',
    },
  ])('should name as the axis of a folder $condition', ({ axis, folderName }) => {
    // Act
    const folderAxis = axisOfFolder(folderName);

    // Assert
    expect(folderAxis).toBe(axis);
  });
});

describe('axisFoldersAmong', () => {
  it("should give the axis folders among a folder's names, in the axes' order", () => {
    // Act
    const axisFolders = axisFoldersAmong([
      '@workflow',
      'react-dom',
      'react.md',
      '@foundation',
      'architecture',
      '@architecture',
    ]);

    // Assert
    expect(axisFolders).toStrictEqual([
      '@foundation',
      '@architecture',
      '@workflow',
    ]);
  });
});

describe('listedChaptersOf', () => {
  it('should give the chapters in the order of the list when it names every chapter once', () => {
    // Arrange
    const chapters = [
      'code',
      'architecture/layers',
    ];

    // Act
    const listed = listedChaptersOf({
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
      listedChaptersOf({
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
