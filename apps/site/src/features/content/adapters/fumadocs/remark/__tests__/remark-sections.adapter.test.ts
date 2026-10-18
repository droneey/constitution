import { describe, expect, it } from 'bun:test';

import { remarkSections } from '../remark-sections.adapter';
import { treeOf } from './mdast.fixtures';

const README = [
  '# The Constitution',
  '',
  'Intro.',
  '',
  '## Quick start',
  '',
  'Install it.',
  '',
  '### Then',
  '',
  'Run the check.',
  '',
  '## Documentation',
  '',
  '- [Guide](docs/guide.md)',
  '',
  '## Licence',
  '',
  'Free.',
].join('\n');

describe('remarkSections', () => {
  it.each([
    {
      condition: 'the page drops two sections',
      expected: '# The Constitution\n\nIntro.\n\n## Licence\n\nFree.',
      options: {
        drop: [
          'Quick start',
          'Documentation',
        ],
      },
    },
    {
      condition: 'the page drops nothing',
      expected: README,
      options: {},
    },
    {
      condition: 'the page keeps one section',
      expected: 'Install it.\n\n### Then\n\nRun the check.',
      options: {
        keep: 'Quick start',
      },
    },
    {
      condition: 'the page keeps a section the file lacks',
      expected: '',
      options: {
        keep: 'Missing',
      },
    },
    {
      condition: 'the page keeps a third-level heading',
      expected: '',
      options: {
        keep: 'Then',
      },
    },
  ])('should leave the sections asked when $condition', ({ expected, options }) => {
    // Arrange
    const tree = treeOf(README);

    // Act
    remarkSections(options)(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf(expected));
  });

  it.each([
    {
      condition: 'the page drops the section of an empty heading',
      expected: 'Intro.\n\n## Licence\n\nFree.',
      options: {
        drop: [
          '',
        ],
      },
    },
    {
      condition: 'the page keeps the section of an empty heading',
      expected: 'Untitled.',
      options: {
        keep: '',
      },
    },
  ])(
    'should tell what precedes the first section from a section when $condition',
    ({ expected, options }) => {
      // Arrange
      const tree = treeOf('Intro.\n\n##\n\nUntitled.\n\n## Licence\n\nFree.');

      // Act
      remarkSections(options)(tree);

      // Assert
      expect(tree).toStrictEqual(treeOf(expected));
    },
  );

  it.each([
    {
      condition: 'the page drops a section whose heading holds a mark',
      expected: 'Intro.\n\n## <img src="mark.svg" alt=""> Licence\n\nFree.',
      options: {
        drop: [
          'Quick start',
        ],
      },
    },
    {
      condition: 'the page keeps a section whose heading holds a mark',
      expected: 'Install it.',
      options: {
        keep: 'Quick start',
      },
    },
  ])('should read a heading by its text without HTML when $condition', ({ expected, options }) => {
    // Arrange
    const tree = treeOf(
      'Intro.\n\n## <img src="mark.svg" alt=""> Quick start\n\nInstall it.\n\n## <img src="mark.svg" alt=""> Licence\n\nFree.',
    );

    // Act
    remarkSections(options)(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf(expected));
  });
});
