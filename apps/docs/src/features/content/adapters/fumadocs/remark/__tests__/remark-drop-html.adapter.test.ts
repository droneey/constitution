import { describe, expect, it } from 'bun:test';

import { remarkDropHtml } from '../remark-drop-html.adapter';
import { inlineCode, text, treeOf } from './mdast.fixtures';

describe('remarkDropHtml', () => {
  it('should drop the banner and the badges when the README opens with them', () => {
    // Arrange
    const tree = treeOf(
      '<p align="center">\n  <img src=".brand/banner.svg" alt="Constitution">\n</p>\n\n<p align="center">\n  <img src=".brand/badge.svg" alt="badge">\n</p>\n\nThe Constitution.',
    );

    // Act
    remarkDropHtml()(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf('The Constitution.'));
  });

  it.each([
    {
      condition: 'the mark leads the heading',
      expected: '## Quick start',
      markdown: '## <img src=".brand/diamond.svg" alt=""> Quick start',
    },
    {
      condition: 'the mark ends the heading',
      expected: '## Quick start',
      markdown: '## Quick start <img src=".brand/diamond.svg" alt="">',
    },
    {
      condition: 'the heading holds no mark',
      expected: '## Quick start',
      markdown: '## Quick start',
    },
    {
      condition: 'the heading holds only its mark',
      expected: '##',
      markdown: '## <img src=".brand/diamond.svg" alt="">',
    },
  ])(
    'should drop the marks of a heading and the space they leave when $condition',
    ({ expected, markdown }) => {
      // Arrange
      const tree = treeOf(markdown);

      // Act
      remarkDropHtml()(tree);

      // Assert
      expect(tree).toStrictEqual(treeOf(expected));
    },
  );

  it('should leave the edges of a heading when they are not text', () => {
    // Arrange
    const tree = treeOf('## `  code  ` and `  more  `');

    // Act
    remarkDropHtml()(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        {
          children: [
            inlineCode(' code '),
            text(' and '),
            inlineCode(' more '),
          ],
          depth: 2,
          type: 'heading',
        },
      ],
      type: 'root',
    });
  });

  it('should drop the HTML inside a list when the README nests it', () => {
    // Arrange
    const tree = treeOf('- One <br> two');

    // Act
    remarkDropHtml()(tree);

    // Assert
    expect(tree).toStrictEqual({
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    text('One '),
                    text(' two'),
                  ],
                  type: 'paragraph',
                },
              ],
              checked: null,
              spread: false,
              type: 'listItem',
            },
          ],
          ordered: false,
          spread: false,
          start: null,
          type: 'list',
        },
      ],
      type: 'root',
    });
  });
});
