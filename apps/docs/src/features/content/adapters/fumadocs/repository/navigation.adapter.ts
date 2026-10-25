import { readFileSync } from 'node:fs';
import { basename, relative } from 'node:path';

import type { ListItem, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as textOf } from 'mdast-util-to-string';

import { withoutMarkdownExtension } from '../../../domain/entities';
import {
  headingTextOf,
  isHeading,
  SECTION_HEADING_DEPTH,
  SUBSECTION_HEADING_DEPTH,
} from '../markdown';
import { DOCUMENTATION_SECTION, ICONS_BY_ADDRESS } from './navigation.constants';
import { addressOf, blockLayerOf, inRepository, repositoryPathOf } from './repository.adapter';
import {
  DOCS_FOLDER,
  QUICK_START,
  README_FILE,
  SITE_DOCUMENTS,
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
  group: string;
}

interface Place {
  fromBase: string;
  page: string | undefined;
}

const sentenceOf = (note: string): string =>
  note === '' ? '' : `${note.charAt(0).toUpperCase()}${note.slice(1)}.`;

const entryOf = (baseUrl: string, listed: ListItem): Entry | undefined => {
  const [paragraph] = listed.children;

  if (paragraph?.type !== 'paragraph') {
    return undefined;
  }

  const link = paragraph.children.find((child) => child.type === 'link');

  if (link === undefined) {
    return undefined;
  }

  const target = repositoryPathOf(inRepository(README_FILE), link.url);

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
  fromMarkdown(readFileSync(inRepository(README_FILE), 'utf8')).children;

const sectionStartOf = (nodes: readonly RootContent[], title: string): number =>
  nodes.findIndex(
    (node) => isHeading(node, SECTION_HEADING_DEPTH) && headingTextOf(node) === title,
  );

const documentationOf = (baseUrl: string): Group[] => {
  const nodes = readmeNodes();
  const start = sectionStartOf(nodes, DOCUMENTATION_SECTION);
  const end = nodes.findIndex(
    (node, index) => index > start && isHeading(node, SECTION_HEADING_DEPTH),
  );
  const groups: Group[] = [];

  if (start === -1) {
    throw new Error(`${README_FILE} has no section ${DOCUMENTATION_SECTION}`);
  }

  for (const node of nodes.slice(start + 1, end === -1 ? undefined : end)) {
    if (isHeading(node, SUBSECTION_HEADING_DEPTH)) {
      groups.push({
        entries: [],
        group: headingTextOf(node),
      });
    }

    if (node.type === 'list') {
      groups
        .at(-1)
        ?.entries.push(...node.children.flatMap((listed) => entryOf(baseUrl, listed) ?? []));
    }
  }

  return groups;
};

const placeOf = (baseUrl: string, address: string): Place => {
  const fromBase = address.startsWith(baseUrl) ? address.slice(baseUrl.length) : address;

  return {
    fromBase,
    page: /^\/[a-z0-9/-]+$/.test(fromBase) ? fromBase.slice(1) : undefined,
  };
};

const linkEntryOf = ({ address, title }: Entry, fromBase: string): string => {
  const icon = ICONS_BY_ADDRESS[fromBase];

  return `${icon === undefined ? '' : `[${icon}]`}[${title}](${address})`;
};

const sidebarEntryOf = (entry: Entry, { fromBase, page }: Place): string => {
  if (entry.layer !== undefined) {
    return entry.layer;
  }

  if (page === undefined || siteLayers.some((folder) => page.startsWith(`${folder}/`))) {
    return linkEntryOf(entry, fromBase);
  }

  if (siteLayers.includes(page)) {
    return page;
  }

  return `./${page}`;
};

const sidebarOf = (
  baseUrl: string,
): {
  pages: string[];
  descriptions: Map<string, string>;
} => {
  const pages: string[] = [];
  const descriptions = new Map<string, string>();

  documentationOf(baseUrl).forEach(({ group, entries }, index) => {
    pages.push(
      `---${group}---`,
      ...(index === 0
        ? [
            'index',
            QUICK_START,
          ]
        : []),
    );

    for (const entry of entries) {
      const place = placeOf(baseUrl, entry.address);

      descriptions.set(place.page ?? place.fromBase, entry.description);
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

const guideIconOf = (path: string): string | undefined =>
  ICONS_BY_ADDRESS[`/${withoutMarkdownExtension(relative(inRepository(DOCS_FOLDER), path))}`];

const documentIconOf = (path: string): string | undefined =>
  ICONS_BY_ADDRESS[`/${SITE_DOCUMENTS[basename(path)]}`];

export { documentIconOf, guideIconOf, sectionSummaryOf, sidebarOf };
