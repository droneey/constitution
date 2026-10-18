import { readFileSync } from 'node:fs';
import { basename, relative } from 'node:path';

import type { ListItem, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as textOf } from 'mdast-util-to-string';

import { headingTextOf, isHeading } from '../markdown';
import {
  addressOf,
  inRepository,
  QUICK_START,
  repositoryPathOf,
  SITE_BLOCKS,
  SITE_DOCUMENTS,
} from './repository.adapter';

const DOCUMENTATION = 'Documentation';

/** the depth of the README's sections, the Documentation among them */
const SECTION_DEPTH = 2;

/** the depth of the Documentation's groups */
const GROUP_DEPTH = 3;

/** the site's icons for the README's entries, by the address each one leads to */
// Stryker disable StringLiteral: the icons are the site's choice of design, which a spec could only restate
const ICONS: Readonly<Record<string, string>> = {
  '': 'BookOpenText',
  '/core#precedence': 'Layers',
  '/core/placement': 'MapPin',
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
  '/reference/templates': 'Files',
};
// Stryker restore StringLiteral

interface Entry {
  /** the address of the page, or of the link when it leads to no page of its own */
  address: string;
  /** what the README says of it after its dash */
  description: string;
  title: string;
}

interface Group {
  entries: Entry[];
  group: string;
}

/** where an entry leads, from the site's base: the page it names, when it names one */
interface Place {
  fromBase: string;
  page: string | undefined;
}

/** the README's note after an entry's dash, as a page's description: a sentence */
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
    title: textOf(link),
  };
};

/** the README's nodes, read when asked */
const readmeNodes = (): RootContent[] =>
  // Stryker disable next-line StringLiteral: the parser reads a buffer as UTF-8 too
  fromMarkdown(readFileSync(inRepository('README.md'), 'utf8')).children;

/** where the README's second-level section of this heading starts, or -1 */
const sectionStartOf = (nodes: readonly RootContent[], title: string): number =>
  nodes.findIndex((node) => isHeading(node, SECTION_DEPTH) && headingTextOf(node) === title);

/** the README's Documentation section, its third-level headings the groups of the sidebar */
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

/** an entry of the sidebar that leads elsewhere than a page of its folder: a link, with its icon */
const linkEntryOf = ({ address, title }: Entry, fromBase: string): string => {
  const icon = ICONS[fromBase];

  return `${icon === undefined ? '' : `[${icon}]`}[${title}](${address})`;
};

/** an entry of the sidebar: a page by its file, a block folder by its name, any other as a link */
const sidebarEntryOf = (entry: Entry, { fromBase, page }: Place): string => {
  if (
    page === undefined ||
    // Stryker disable next-line MethodExpression: the site renders one block folder, so some and every agree
    SITE_BLOCKS.some((folder) => page.startsWith(`${folder}/`))
  ) {
    return linkEntryOf(entry, fromBase);
  }
  if (SITE_BLOCKS.includes(page)) {
    return page;
  }

  return `./${page}`;
};

/**
 * The sidebar, in the order the README's Documentation lists the pages: a page by its file, a block
 * folder by its name, any other entry as a link. The overview and the quick start open the first group.
 */
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

/** the first paragraph of the quote right under one of the README's second-level headings, as plain text */
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

/** the icon of a guide, by its file */
const guideIconOf = (path: string): string | undefined =>
  // Stryker disable next-line Regex: a guide's path holds .md only at its end
  ICONS[`/${relative(inRepository('docs'), path).replace(/\.md$/, '')}`];

/** the icon of a document the site renders beside the README, by its file */
const documentIconOf = (path: string): string | undefined =>
  ICONS[`/${SITE_DOCUMENTS[basename(path)]}`];

export { documentIconOf, guideIconOf, ICONS, sectionSummaryOf, sidebarOf };
