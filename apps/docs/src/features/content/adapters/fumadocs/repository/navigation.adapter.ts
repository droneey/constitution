import { readFileSync } from 'node:fs';
import { basename, relative } from 'node:path';

import type { ListItem, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as textOf } from 'mdast-util-to-string';

import { headingTextOf, isHeading } from '../markdown';
import {
  addressOf,
  blockLayerOf,
  inRepository,
  QUICK_START,
  repositoryPathOf,
  SITE_DOCUMENTS,
  SITE_LAYERS,
} from './repository.adapter';

const DOCUMENTATION = 'Documentation';

const SECTION_DEPTH = 2;

const GROUP_DEPTH = 3;

/** by the address each entry leads to, from the site's base */
// Stryker disable StringLiteral: the icons are the site's choice of design, which a spec could only restate
const ICONS: Readonly<Record<string, string>> = {
  '': 'BookOpenText',
  '/core#precedence': 'Layers',
  '/core/foundation/placement': 'MapPin',
  '/decisions': 'Scale',
  '/glossary': 'BookA',
  '/guides/check-in-ci': 'GitPullRequest',
  '/guides/choose-blocks': 'Blocks',
  '/guides/override-a-rule': 'ChevronsDown',
  '/guides/upgrade': 'CircleArrowUp',
  '/guides/use-the-presets': 'SlidersHorizontal',
  '/guides/write-a-pack': 'Package',
  '/how-it-works': 'Workflow',
  '/quick-start': 'SquareTerminal',
  '/reference/block-format': 'FileText',
  '/reference/constitution-yaml': 'FileCode',
  '/reference/plugin': 'Plug',
  '/reference/presets': 'Settings2',
  '/reference/skills': 'SquareSlash',
  '/reference/templates': 'Files',
};
// Stryker restore StringLiteral

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

  const target = repositoryPathOf(inRepository('README.md'), link.url);

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
  fromMarkdown(readFileSync(inRepository('README.md'), 'utf8')).children;

const sectionStartOf = (nodes: readonly RootContent[], title: string): number =>
  nodes.findIndex((node) => isHeading(node, SECTION_DEPTH) && headingTextOf(node) === title);

const documentationOf = (baseUrl: string): Group[] => {
  const nodes = readmeNodes();
  const start = sectionStartOf(nodes, DOCUMENTATION);
  const end = nodes.findIndex((node, index) => index > start && isHeading(node, SECTION_DEPTH));
  const groups: Group[] = [];

  if (start === -1) {
    throw new Error(`README.md has no section ${DOCUMENTATION}`);
  }
  for (const node of nodes.slice(start + 1, end === -1 ? undefined : end)) {
    if (isHeading(node, GROUP_DEPTH)) {
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
  const icon = ICONS[fromBase];

  return `${icon === undefined ? '' : `[${icon}]`}[${title}](${address})`;
};

const sidebarEntryOf = (entry: Entry, { fromBase, page }: Place): string => {
  if (entry.layer !== undefined) {
    return entry.layer;
  }
  if (page === undefined || SITE_LAYERS.some((folder) => page.startsWith(`${folder}/`))) {
    return linkEntryOf(entry, fromBase);
  }
  if (SITE_LAYERS.includes(page)) {
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
  // Stryker disable next-line Regex: a guide's path holds .md only at its end
  ICONS[`/${relative(inRepository('docs'), path).replace(/\.md$/, '')}`];

const documentIconOf = (path: string): string | undefined =>
  ICONS[`/${SITE_DOCUMENTS[basename(path)]}`];

export { documentIconOf, guideIconOf, ICONS, sectionSummaryOf, sidebarOf };
