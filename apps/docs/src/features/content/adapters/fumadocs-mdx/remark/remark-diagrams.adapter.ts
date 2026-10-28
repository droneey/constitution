import { renderMermaidSVG } from 'beautiful-mermaid';
import { fromHtml } from 'hast-util-from-html';
import type { Data, Node, Root } from 'mdast';

import { replaceFencedBlocks } from '../markdown';
import { DIAGRAM_COLOURS, DIAGRAM_LANGUAGE, DIAGRAM_SPACING_PX } from './remark-diagrams.constants';

interface Diagram extends Node {
  data: Data;
  type: 'diagram';
}

declare module 'mdast' {
  interface BlockContentMap {
    diagram: Diagram;
  }
  interface RootContentMap {
    diagram: Diagram;
  }
}

type FigureContent = NonNullable<Data['hChildren']>[number];

type ParsedContent = ReturnType<typeof fromHtml>['children'][number];

const labelOf = (chart: string): string =>
  `Diagram: ${[
    ...chart.matchAll(/\[([^\]]+)\]/g),
  ]
    .map((match) => match[1])
    .join(', ')}`;

const isFigureContent = (child: ParsedContent): child is FigureContent =>
  // Stryker disable next-line ConditionalExpression,LogicalOperator,StringLiteral: a fragment of SVG holds no doctype and no ESM, so the check only narrows the type
  child.type !== 'doctype' && child.type !== 'mdxjsEsm';

const diagramOf = (chart: string): Diagram => {
  const svg = renderMermaidSVG(chart, {
    ...DIAGRAM_COLOURS,
    layerSpacing: DIAGRAM_SPACING_PX,
    nodeSpacing: DIAGRAM_SPACING_PX,
    padding: DIAGRAM_SPACING_PX,
    transparent: true,
  });
  const parsed = fromHtml(svg, {
    fragment: true,
    // Stryker disable next-line StringLiteral: the fragment opens with its svg element, which puts the parser in SVG's space either way
    space: 'svg',
  });
  // Stryker disable next-line MethodExpression: a fragment of SVG holds no doctype and no ESM, so the filter only narrows the type
  const elements = parsed.children.filter(isFigureContent);

  return {
    data: {
      hChildren: elements,
      hName: 'figure',
      hProperties: {
        'aria-label': labelOf(chart),
        'data-diagram': '',
        role: 'img',
      },
    },
    // Stryker disable next-line StringLiteral: mdast-util-to-hast renders a node by its data whatever its type, so the page is the same
    type: 'diagram',
  };
};

const remarkDiagrams =
  () =>
  (tree: Root): void => {
    replaceFencedBlocks(tree, DIAGRAM_LANGUAGE, (code) => diagramOf(code.value));
  };

export { remarkDiagrams };
