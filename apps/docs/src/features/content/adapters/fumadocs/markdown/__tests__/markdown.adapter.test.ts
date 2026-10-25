import { describe, expect, it } from 'bun:test';

import type { Heading, RootContent } from 'mdast';

import { headingTextOf, isHeading, plainTextOf } from '../markdown.adapter';

describe('plainTextOf', () => {
  it('should read the text without its marks when a line has some', () => {
    // Arrange
    const markdown = '**names**, `code`, [links](docs/links.md).';

    // Act
    const text = plainTextOf(markdown);

    // Assert
    expect(text).toBe('names, code, links.');
  });
});

describe('isHeading', () => {
  it.each<{
    condition: string;
    depth: number;
    expected: boolean;
    node: RootContent;
  }>([
    {
      condition: 'the heading has the depth asked',
      depth: 2,
      expected: true,
      node: {
        children: [],
        depth: 2,
        type: 'heading',
      },
    },
    {
      condition: 'the heading is deeper',
      depth: 2,
      expected: false,
      node: {
        children: [],
        depth: 3,
        type: 'heading',
      },
    },
    {
      condition: 'the node is a paragraph',
      depth: 2,
      expected: false,
      node: {
        children: [],
        type: 'paragraph',
      },
    },
  ])('should tell a heading of the depth when $condition', ({ depth, expected, node }) => {
    // Arrange
    const asked = depth;

    // Act
    const found = isHeading(node, asked);

    // Assert
    expect(found).toBe(expected);
  });
});

describe('headingTextOf', () => {
  it('should read the text a reader sees when the heading holds HTML', () => {
    // Arrange
    const heading: Heading = {
      children: [
        {
          type: 'html',
          value: '<img src=".brand/diamond.svg" alt="">',
        },
        {
          type: 'text',
          value: ' Quick ',
        },
        {
          children: [
            {
              type: 'text',
              value: 'start',
            },
          ],
          type: 'emphasis',
        },
        {
          type: 'text',
          value: ' ',
        },
      ],
      depth: 2,
      type: 'heading',
    };

    // Act
    const text = headingTextOf(heading);

    // Assert
    expect(text).toBe('Quick start');
  });
});
