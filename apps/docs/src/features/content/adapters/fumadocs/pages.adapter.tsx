import type { Item } from 'fumadocs-core/page-tree';
import type { LoaderPlugin } from 'fumadocs-core/source';
import { ArrowRight } from 'lucide-react';

import { docsRoute, mainContentId } from '#/shared/constants';

import { isPassportPath, pageSlugsOf } from '../../domain/utils';

interface MarkdownPage {
  data: {
    getText: (kind: 'processed') => Promise<string>;
    title: string;
  };
  url: string;
}

/** a page's path in its collection, by the path the site serves it under */
const collectionPaths = new Map<string, string>();

/** records each file's path in its collection, for `collectionPathOf` */
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

const passportAsIndex = (path: string): string =>
  `${pageSlugsOf(path).join('/')}${isPassportPath(path) ? '/index' : ''}.md`;

const collectionPathOf = (path: string): string => collectionPaths.get(path) ?? path;

/**
 * A link to a whole page leads to its main region, since the library places a page, for its
 * breadcrumbs, its neighbours and the open folder, at the first entry of its address.
 */
const crossLinked = (node: Item, path: string | undefined): Item => {
  if (path !== undefined || node.external === true || !node.url.startsWith(docsRoute)) {
    return node;
  }

  return {
    ...node,
    url: node.url.includes('#') ? node.url : `${node.url}#${mainContentId}`,
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

export { collectionPathOf, crossLinks, markdownOfPage, passportAsIndex, renamed };
