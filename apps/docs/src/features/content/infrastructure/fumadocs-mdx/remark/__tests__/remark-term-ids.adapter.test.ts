import { describe, expect, it } from 'bun:test';

import { createStringifier } from 'fumadocs-core/mdx-plugins/stringifier';
import type { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';

import { remarkTermIds } from '../remark-term-ids.adapter';
import { treeOf, withoutPositions } from './mdast.fixtures';

const anchored = (input: { id: string; markdown: string }): Root => {
  const tree = treeOf(input.markdown);

  visit(tree, 'strong', (strong) => {
    strong.data = {
      hProperties: {
        id: input.id,
      },
    };
  });

  return tree;
};

describe('remarkTermIds', () => {
  it('should make the id after a bold term its anchor and take it off the text and the Markdown', () => {
    // Arrange
    const markdown = 'The **`adapters/`**{#gateway} hold the *adapters* of ports.';
    const tree = fromMarkdown(markdown);
    const file = new VFile(markdown);

    // Act
    remarkTermIds()(tree, file);

    // Assert
    expect({
      markdown: createStringifier(file).stringify(tree),
      tree: withoutPositions(tree),
    }).toStrictEqual({
      markdown: 'The **`adapters/`** hold the *adapters* of ports.',
      tree: anchored({
        id: 'gateway',
        markdown: 'The **`adapters/`** hold the *adapters* of ports.',
      }),
    });
  });

  it.each([
    {
      condition: 'braces stand apart from the bold',
      markdown: '**`adapters/`** {#gateway} holds them.',
    },
    {
      condition: 'braces follow plain text',
      markdown: 'The folder{#gateway} holds them.',
    },
    {
      condition: 'braces follow code that is not bold',
      markdown: '`adapters/`{#gateway} holds them.',
    },
    {
      condition: 'code follows the bold',
      markdown: '**`adapters/`**`{#gateway}` holds them.',
    },
    {
      condition: 'the bold ends its paragraph',
      markdown: 'It holds **`adapters/`**',
    },
  ])('should leave the text as written when $condition', ({ markdown }) => {
    // Arrange
    const tree = treeOf(markdown);

    // Act
    remarkTermIds()(tree, new VFile(markdown));

    // Assert
    expect(tree).toStrictEqual(treeOf(markdown));
  });
});
