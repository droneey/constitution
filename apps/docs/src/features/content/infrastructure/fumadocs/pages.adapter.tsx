import type { ReactNode } from 'react';
import { isValidElement } from 'react';

import { Icon, IconName } from '@droneey/design-browser/react-dom';
import type { Item } from 'fumadocs-core/page-tree';
import type { LoaderPlugin } from 'fumadocs-core/source';

import { DOCS_ROUTE, MAIN_CONTENT_ID } from '#/shared/constants';

import { Page } from '../../domain/entities';
import type { SiteBasePath } from '../../domain/value-objects';
import { BlockPath } from '../../domain/value-objects';

interface MarkdownPage {
  data: {
    getText: (kind: 'processed') => Promise<string>;
    title: string;
  };
  url: string;
}

interface SitePaths {
  readonly collectionPathOf: (sitePath: string) => string;
  readonly servedUnderSitePaths: <
    TSource extends {
      files: {
        path: string;
      }[];
    },
  >(
    source: TSource,
    sitePathOf: (collectionPath: string) => string,
  ) => TSource;
}

const createSitePaths = (): SitePaths => {
  const collectionPathsBySitePath = new Map<string, string>();

  return {
    collectionPathOf: (sitePath) => collectionPathsBySitePath.get(sitePath) ?? sitePath,
    servedUnderSitePaths: (source, sitePathOf) => ({
      ...source,
      files: source.files.map((file) => {
        const sitePath = sitePathOf(file.path);

        collectionPathsBySitePath.set(sitePath, file.path);

        return {
          ...file,
          path: sitePath,
        };
      }),
    }),
  };
};

/** @throws {InvalidValueError} when the path names no Markdown file of the blocks folder */
const passportAsIndex = (collectionPath: string): string => {
  const blockPath = BlockPath.create(collectionPath);

  return `${Page.slugsOf(blockPath).join('/')}${Page.isPassportPath(blockPath) ? '/index' : ''}.md`;
};

// Why: the library places a page, for its breadcrumbs, its neighbours and the open folder, at the
// first entry of its address, so a link to a whole page leads to its main region.
const crossLinked = (node: Item, filePath: string | undefined): Item => {
  if (filePath !== undefined || node.external === true || !node.url.startsWith(DOCS_ROUTE)) {
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

// Why: the sidebar writes a link by its address, which the loader leaves off the base it serves its
// pages under.
const linksUnder = (siteBasePath: SiteBasePath): LoaderPlugin => ({
  // Stryker disable next-line StringLiteral: the name only labels the plugin in fumadocs' diagnostics
  name: 'links-under-site-base',
  transformPageTree: {
    file: (node) =>
      node.url.startsWith(DOCS_ROUTE)
        ? {
            ...node,
            url: `${siteBasePath}${node.url.slice(1)}`,
          }
        : node,
  },
});

const textOfName = (name: ReactNode): string => {
  if (typeof name === 'string') {
    return name;
  }

  if (Array.isArray(name)) {
    return name.map(textOfName).join('');
  }

  return isValidElement<{
    children?: ReactNode;
  }>(name)
    ? textOfName(name.props.children)
    : '';
};

const markdownOfPage = async (
  page: MarkdownPage,
): Promise<string> => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`;

export { createSitePaths, crossLinks, linksUnder, markdownOfPage, passportAsIndex, textOfName };
