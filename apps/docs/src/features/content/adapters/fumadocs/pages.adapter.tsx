import { Icon, IconName } from '@droneey/design-browser/react-dom';
import type { Item } from 'fumadocs-core/page-tree';
import type { LoaderPlugin } from 'fumadocs-core/source';

import { DOCS_ROUTE, MAIN_CONTENT_ID } from '#/shared/constants';

import { isPassportPath, pageSlugsOf } from '../../domain/entities';

interface MarkdownPage {
  data: {
    getText: (kind: 'processed') => Promise<string>;
    title: string;
  };
  url: string;
}

interface SitePaths {
  /** the path a page has in its collection, from the path the site serves it under */
  readonly collectionPathOf: (path: string) => string;
  /** records each file's path in its collection, for `collectionPathOf` */
  readonly servedUnderSitePaths: <
    TSource extends {
      files: {
        path: string;
      }[];
    },
  >(
    from: TSource,
    sitePathOf: (path: string) => string,
  ) => TSource;
}

const createSitePaths = (): SitePaths => {
  const collectionPathsBySitePath = new Map<string, string>();

  return {
    collectionPathOf: (path) => collectionPathsBySitePath.get(path) ?? path,
    servedUnderSitePaths: (from, sitePathOf) => ({
      ...from,
      files: from.files.map((file) => {
        const path = sitePathOf(file.path);

        collectionPathsBySitePath.set(path, file.path);

        return {
          ...file,
          path,
        };
      }),
    }),
  };
};

const passportAsIndex = (path: string): string =>
  `${pageSlugsOf(path).join('/')}${isPassportPath(path) ? '/index' : ''}.md`;

/**
 * A link to a whole page leads to its main region, since the library places a page, for its
 * breadcrumbs, its neighbours and the open folder, at the first entry of its address.
 */
const crossLinked = (node: Item, path: string | undefined): Item => {
  if (path !== undefined || node.external === true || !node.url.startsWith(DOCS_ROUTE)) {
    return node;
  }

  return {
    ...node,
    url: node.url.includes('#') ? node.url : `${node.url}#${MAIN_CONTENT_ID}`,
    name: (
      <>
        {node.name}
        <Icon
          data-cross-link=''
          name={IconName.Forward}
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

export { createSitePaths, crossLinks, markdownOfPage, passportAsIndex };
