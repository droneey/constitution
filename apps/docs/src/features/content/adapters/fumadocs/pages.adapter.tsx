import type { Item } from 'fumadocs-core/page-tree';
import type { LoaderPlugin } from 'fumadocs-core/source';
import { ArrowRight } from 'lucide-react';

import { docsRoute } from '#/shared/constants';

import { pageSlugsOf } from '../../domain/utils';

interface MarkdownPage {
  data: {
    getText: (kind: 'processed') => Promise<string>;
    title: string;
  };
  url: string;
}

/** the paths the collections know their pages by, by the path the site serves each one under */
const collectionPaths = new Map<string, string>();

/** a source whose files are served under other paths: the README's parts, and a block's card as its folder's index */
const renamed = <
  TSource extends {
    files: {
      path: string;
    }[];
  },
>(
  from: TSource,
  pathOf: (path: string) => string,
): TSource => ({
  ...from,
  files: from.files.map((file) => {
    const path = pathOf(file.path);

    collectionPaths.set(path, file.path);
    return {
      ...file,
      path,
    };
  }),
});

/** a block's card, `<id>/<id>.md`, served as its folder's index */
const cardAsIndex = (path: string): string =>
  pageSlugsOf(path).length < path.split('/').length
    ? `${path.slice(0, path.lastIndexOf('/'))}/index.md`
    : path;

const collectionPathOf = (path: string): string => collectionPaths.get(path) ?? path;

/** a sidebar entry that leads to a page of another section carries an arrow after its name */
const crossLinked = (node: Item, path: string | undefined): Item => {
  if (path !== undefined || node.external === true || !node.url.startsWith(docsRoute)) {
    return node;
  }

  return {
    ...node,
    name: (
      <>
        {node.name}
        <ArrowRight
          aria-hidden
          data-cross-link=''
        />
      </>
    ),
  };
};

const crossLinks: LoaderPlugin = {
  // Stryker disable next-line StringLiteral: the name only labels the plugin in fumadocs' diagnostics
  name: 'cross-links',
  transformPageTree: {
    file: crossLinked,
  },
};

const markdownOfPage = async (
  page: MarkdownPage,
): Promise<string> => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`;

export { cardAsIndex, collectionPathOf, crossLinks, markdownOfPage, renamed };
