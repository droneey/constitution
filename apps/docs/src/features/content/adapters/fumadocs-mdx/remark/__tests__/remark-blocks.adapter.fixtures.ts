import type { Nodes, Root, RootContent } from 'mdast';
import { toString as plainText } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

const attributeOf = (node: Nodes, name: string): unknown =>
  node.data?.hProperties?.[`data-${name}`];

/** the first part of the card the plugin marks with the name, in reading order */
const partOf = (tree: Nodes, name: string): Nodes | undefined => {
  const parts: Nodes[] = [];

  visit(tree, (node) => {
    if (attributeOf(node, name) !== undefined) {
      parts.push(node);
    }
  });

  return parts[0];
};

const slugOf = (card: Nodes): string => {
  const heading = partOf(card, 'rule');
  const slugs: string[] = [];

  if (heading !== undefined) {
    visit(heading, 'inlineCode', (node) => {
      slugs.push(node.value);
    });
  }

  return slugs.join('');
};

/** the plugin marks every part of a card, so a node without marks is the author's */
const isAuthored = (node: RootContent): boolean =>
  Object.keys(node.data?.hProperties ?? {}).length === 0;

interface CardOutline {
  readonly body: readonly string[];
  readonly rule: string;
}

const outlineOf = (tree: Root): ReadonlyArray<CardOutline | string> =>
  tree.children.map((node) =>
    node.type === 'ruleCard'
      ? {
          body: node.children.filter(isAuthored).map((child) => plainText(child)),
          rule: slugOf(node),
        }
      : plainText(node),
  );

interface LinkOutline {
  readonly text: string;
  readonly url: string;
}

const linksOf = (tree: Root): readonly LinkOutline[] => {
  const links: LinkOutline[] = [];

  visit(tree, 'link', (node) => {
    links.push({
      text: plainText(node),
      url: node.url,
    });
  });

  return links;
};

/** the meta of each block of code, which the site's highlighter reads a title from */
const codeMetasOf = (tree: Root): readonly (string | null | undefined)[] => {
  const metas: (string | null | undefined)[] = [];

  visit(tree, 'code', (node) => {
    metas.push(node.meta);
  });

  return metas;
};

export { codeMetasOf, linksOf, outlineOf };
