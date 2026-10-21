import { renderMermaidSVG } from 'beautiful-mermaid';
import { fromHtml } from 'hast-util-from-html';
import type { Data, Node, Root } from 'mdast';
import { visit } from 'unist-util-visit';

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

/** in pixels, between the nodes of a diagram, its layers and its edge */
const SPACING = 32;

const COLOURS = {
  accent: 'var(--color-accent-solid)',
  bg: 'var(--color-surface-base)',
  border: 'color-mix(in oklch, var(--color-accent-solid) 45%, transparent)',
  fg: 'var(--color-text-primary)',
  line: 'color-mix(in oklch, var(--color-accent-solid) 60%, var(--color-text-muted))',
  muted: 'var(--color-text-muted)',
  surface: 'color-mix(in oklch, var(--color-accent-solid) 7%, var(--color-surface-level-1))',
};

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
    ...COLOURS,
    layerSpacing: SPACING,
    nodeSpacing: SPACING,
    padding: SPACING,
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
    type: 'diagram',
  };
};

// The SVG joins the page as its elements rather than as injected markup.
const remarkDiagrams =
  () =>
  (tree: Root): void => {
    // Stryker disable next-line StringLiteral: only code has a language, so visiting every node finds the same ones
    visit(tree, 'code', (node, index, parent) => {
      if (
        node.lang !== 'mermaid' ||
        // Stryker disable next-line ConditionalExpression: a code node always has a parent, so the check only narrows its type
        parent === undefined ||
        // Stryker disable next-line ConditionalExpression: a code node always has an index, so the check only narrows its type
        index === undefined
      ) {
        return;
      }
      parent.children.splice(index, 1, diagramOf(node.value));
    });
  };

export { remarkDiagrams };
