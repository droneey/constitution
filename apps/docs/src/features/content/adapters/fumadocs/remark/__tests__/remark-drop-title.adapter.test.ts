import { describe, expect, it } from 'bun:test';

import { remarkDropSummary, remarkDropTitle } from '../remark-drop-title.adapter';
import { treeOf } from './mdast.fixtures';

describe('remarkDropTitle', () => {
  it.each([
    {
      condition: 'the quote says more than its summary',
      expected: '> More.\n\nBody.',
      markdown: '# Title\n\n> Summary.\n>\n> More.\n\nBody.',
    },
    {
      condition: 'the quote is only the summary',
      expected: 'Body.',
      markdown: '# Title\n\n> Summary.\n\nBody.',
    },
    {
      condition: 'the file has no quote',
      expected: 'Body.\n\n> Later.',
      markdown: '# Title\n\nBody.\n\n> Later.',
    },
    {
      condition: 'the file holds only its title',
      expected: '',
      markdown: '# Title',
    },
    {
      condition: 'the file opens with a second-level heading',
      expected: '## Section\n\n> Quote.',
      markdown: '## Section\n\n> Quote.',
    },
    {
      condition: 'the file opens with a paragraph',
      expected: 'Intro.\n\n# Title',
      markdown: 'Intro.\n\n# Title',
    },
    {
      condition: 'the file is empty',
      expected: '',
      markdown: '',
    },
  ])('should drop the title and summary when $condition', ({ expected, markdown }) => {
    // Arrange
    const tree = treeOf(markdown);

    // Act
    remarkDropTitle()(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf(expected));
  });
});

describe('remarkDropSummary', () => {
  it.each([
    {
      condition: 'the quote says more than its summary',
      expected: '> More.\n\nBody.',
      markdown: '> Summary.\n>\n> More.\n\nBody.',
    },
    {
      condition: 'the quote is only the summary',
      expected: 'Body.',
      markdown: '> Summary.\n\nBody.',
    },
    {
      condition: 'the page opens with no quote',
      expected: 'Body.\n\n> Later.',
      markdown: 'Body.\n\n> Later.',
    },
    {
      condition: 'the page is empty',
      expected: '',
      markdown: '',
    },
  ])('should drop the summary when $condition', ({ expected, markdown }) => {
    // Arrange
    const tree = treeOf(markdown);

    // Act
    remarkDropSummary()(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf(expected));
  });
});
