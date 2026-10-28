import { describe, expect, it } from 'bun:test';

import { goldenText } from '#/__tests__/golden.fixtures';

import { remarkDiagrams } from '../remark-diagrams.adapter';
import type { MarkdownVariant } from './html.fixtures';
import { htmlOfVariants } from './html.fixtures';
import { treeOf } from './mdast.fixtures';

describe('remarkDiagrams', () => {
  it('should draw a Mermaid block as the figure of its SVG the golden file shows', async () => {
    // Arrange
    const variants = {
      'a flowchart in a quote': {
        markdown: '> ```mermaid\n> flowchart LR\n>   A[Rule] --> B[Block]\n> ```',
        plugins: [
          remarkDiagrams,
        ],
      },
    } satisfies Readonly<Record<string, MarkdownVariant>>;

    // Act
    const html = htmlOfVariants(variants);

    // Assert
    // in a text file, as Biome lints HTML and the SVG beautiful-mermaid draws trips its rules
    expect(html).toBe(
      await goldenText(new URL('remark-diagrams.adapter.golden.txt', import.meta.url), html),
    );
  });

  it('should leave a block of code when it is not Mermaid', () => {
    // Arrange
    const tree = treeOf('```ts\nconst a = 1;\n```');

    // Act
    remarkDiagrams()(tree);

    // Assert
    expect(tree).toStrictEqual(treeOf('```ts\nconst a = 1;\n```'));
  });
});
