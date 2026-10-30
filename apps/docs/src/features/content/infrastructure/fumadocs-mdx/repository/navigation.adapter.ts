import { readFileSync } from 'node:fs';
import { basename, relative } from 'node:path';

import type { ListItem, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as textOf } from 'mdast-util-to-string';

import { SourceError, SourceFailure } from '../../../domain/errors';
import { withoutMarkdownExtension } from '../../../domain/utils';
import type { AbsolutePath } from '../../../domain/value-objects';
import {
  headingTextOf,
  isHeading,
  SECTION_HEADING_DEPTH,
  SUBSECTION_HEADING_DEPTH,
} from '../markdown';
import { DOCUMENTATION_SECTION } from './navigation.constants';
import { ICONS_BY_ADDRESS } from './navigation-icons.constants';
import { addressOf, blockLayerOf, inRepository, linkTargetOf } from './repository.adapter';
import {
  docsFolderPath,
  QUICK_START,
  readmeFilePath,
  siteDocuments,
  siteLayers,
} from './repository.constants';

interface Entry {
  address: string;
  description: string;
  layer: string | undefined;
  title: string;
}

interface Group {
  entries: Entry[];
  title: string;
}

interface Place {
  addressFromBase: string;
  pagePath: string | undefined;
}

const sentenceOf = (note: string): string =>
  note === '' ? '' : `${note.charAt(0).toUpperCase()}${note.slice(1)}.`;

const entryOf = (baseUrl: string, listItem: ListItem): Entry | undefined => {
  const [paragraph] = listItem.children;

  if (paragraph?.type !== 'paragraph') {
    return undefined;
  }

  const link = paragraph.children.find((child) => child.type === 'link');

  if (link === undefined) {
    return undefined;
  }

  const target = linkTargetOf(inRepository(readmeFilePath), link.url);

  if (target === undefined) {
    return undefined;
  }

  return {
    address: addressOf(baseUrl, target.path, target.hash),
    description: sentenceOf(textOf(paragraph).split(' — ')[1] ?? ''),
    layer: blockLayerOf(target.path),
    title: textOf(link),
  };
};

const readmeNodes = (): RootContent[] =>
  // Stryker disable next-line StringLiteral: the parser reads a buffer as UTF-8 too
  fromMarkdown(readFileSync(inRepository(readmeFilePath), 'utf8')).children;

const sectionStartOf = (nodes: readonly RootContent[], title: string): number =>
  nodes.findIndex(
    (node) => isHeading(node, SECTION_HEADING_DEPTH) && headingTextOf(node) === title,
  );

/** @throws {SourceError} when the README has no Documentation section */
const documentationOf = (baseUrl: string): Group[] => {
  const nodes = readmeNodes();
  const start = sectionStartOf(nodes, DOCUMENTATION_SECTION);
  const end = nodes.findIndex(
    (node, index) => index > start && isHeading(node, SECTION_HEADING_DEPTH),
  );
  const groups: Group[] = [];

  if (start === -1) {
    throw new SourceError({
      code: SourceFailure.ReadmeSectionMissing,
      details: {
        path: readmeFilePath,
        section: DOCUMENTATION_SECTION,
      },
    });
  }

  for (const node of nodes.slice(start + 1, end === -1 ? undefined : end)) {
    if (isHeading(node, SUBSECTION_HEADING_DEPTH)) {
      groups.push({
        entries: [],
        title: headingTextOf(node),
      });
    }

    if (node.type === 'list') {
      groups
        .at(-1)
        ?.entries.push(...node.children.flatMap((listItem) => entryOf(baseUrl, listItem) ?? []));
    }
  }

  return groups;
};

const placeOf = (baseUrl: string, address: string): Place => {
  const addressFromBase = address.startsWith(baseUrl) ? address.slice(baseUrl.length) : address;

  return {
    addressFromBase,
    pagePath: /^\/[a-z0-9/-]+$/.test(addressFromBase) ? addressFromBase.slice(1) : undefined,
  };
};

const linkEntryOf = ({ address, title }: Entry, addressFromBase: string): string => {
  const icon = ICONS_BY_ADDRESS[addressFromBase];

  return `${icon === undefined ? '' : `[${icon}]`}[${title}](${address})`;
};

const sidebarEntryOf = (entry: Entry, { addressFromBase, pagePath }: Place): string => {
  if (entry.layer !== undefined) {
    return entry.layer;
  }

  if (
    pagePath === undefined ||
    siteLayers.some((siteLayer) => pagePath.startsWith(`${siteLayer}/`))
  ) {
    return linkEntryOf(entry, addressFromBase);
  }

  if (siteLayers.includes(pagePath)) {
    return pagePath;
  }

  return `./${pagePath}`;
};

/** @throws {SourceError} when the README has no Documentation section */
const sidebarOf = (
  baseUrl: string,
): {
  pages: string[];
  descriptions: Map<string, string>;
} => {
  const pages: string[] = [];
  const descriptions = new Map<string, string>();

  documentationOf(baseUrl).forEach(({ entries, title }, index) => {
    pages.push(
      `---${title}---`,
      ...(index === 0
        ? [
            'index',
            QUICK_START,
          ]
        : []),
    );

    for (const entry of entries) {
      const place = placeOf(baseUrl, entry.address);

      descriptions.set(place.pagePath ?? place.addressFromBase, entry.description);
      pages.push(sidebarEntryOf(entry, place));
    }
  });

  return {
    descriptions,
    pages,
  };
};

const sectionSummaryOf = (title: string): string | undefined => {
  const nodes = readmeNodes();
  const start = sectionStartOf(nodes, title);
  const quote = start === -1 ? undefined : nodes[start + 1];

  if (quote?.type !== 'blockquote') {
    return undefined;
  }

  const [summary] = quote.children;

  return summary?.type === 'paragraph' ? textOf(summary) : undefined;
};

const guideIconOf = (filePath: AbsolutePath): string | undefined =>
  ICONS_BY_ADDRESS[
    `/${withoutMarkdownExtension(relative(inRepository(docsFolderPath), filePath))}`
  ];

const documentIconOf = (filePath: AbsolutePath): string | undefined =>
  ICONS_BY_ADDRESS[`/${siteDocuments[basename(filePath)]}`];

export { documentIconOf, guideIconOf, sectionSummaryOf, sidebarOf };
