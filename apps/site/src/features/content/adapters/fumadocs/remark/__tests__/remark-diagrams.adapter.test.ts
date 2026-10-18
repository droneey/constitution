import { describe, expect, it } from 'bun:test';

import { remarkDiagrams } from '../remark-diagrams.adapter';
import { treeOf } from './mdast.fixtures';
import { goldenFlowchart } from './remark-diagrams.adapter.fixtures';

describe('remarkDiagrams', () => {
  it('should draw a Mermaid block as a figure of its SVG when a page holds one', () => {
    // Arrange
    const tree = treeOf('> ```mermaid\n> flowchart LR\n>   A[Rule] --> B[Block]\n> ```');

    // Act
    remarkDiagrams()(tree);

    // Assert
    expect<unknown>(tree).toStrictEqual({
      children: [
        {
          children: [
            {
              data: {
                hChildren: goldenFlowchart(),
                hName: 'figure',
                hProperties: {
                  'aria-label': 'Diagram: Rule, Block',
                  'data-diagram': '',
                  role: 'img',
                },
              },
              type: 'diagram',
            },
          ],
          type: 'blockquote',
        },
      ],
      type: 'root',
    });
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
