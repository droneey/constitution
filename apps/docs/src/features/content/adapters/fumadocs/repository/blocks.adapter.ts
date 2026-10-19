import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { parse } from 'yaml';

import { chapterListGapsOf, readingOrderOf } from '../../../domain/utils';
import { cardModel } from './models';
import { BLOCKS_FOLDER, inRepository } from './repository.adapter';

const MARKDOWN = '.md';

/** the chapter of core whose list of core's chapters gives the order they are read in */
const PLACEMENT = 'placement.md';

const FRONT_MATTER = /---\n([\s\S]*?)\n---\n/;

const inBlocks = (...parts: string[]): string => inRepository(join(BLOCKS_FOLDER, ...parts));

const linksIn = (node: Nodes): readonly string[] => [
  ...(node.type === 'link'
    ? [
        node.url,
      ]
    : []),
  ...('children' in node ? node.children.flatMap(linksIn) : []),
];

/** core's chapters by their paths in core's folder, without `.md`, its card left out */
const coreChapterFilesOf = (): readonly string[] =>
  readdirSync(inBlocks('core'), {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith(MARKDOWN) && path !== `core${MARKDOWN}`)
    .map((path) => path.slice(0, -MARKDOWN.length));

/** core's chapters in the order placement lists them, which a chapter added without a place in that list stops */
const coreChaptersOf = (): readonly string[] => {
  const listed = linksIn(
    // Stryker disable next-line StringLiteral: the parser reads a buffer as UTF-8 too
    fromMarkdown(readFileSync(inBlocks('core', PLACEMENT), 'utf8')),
  ).map((url) => url.slice(0, -MARKDOWN.length));
  const gaps = chapterListGapsOf({
    chapters: coreChapterFilesOf(),
    listed,
  });
  const problems = [
    ...gaps.missing.map((chapter) => `leaves out ${chapter}`),
    ...gaps.unknown.map((entry) => `lists ${entry}, which core does not have`),
    ...gaps.repeated.map((entry) => `lists ${entry} twice`),
  ];

  if (problems.length > 0) {
    throw new Error(`${PLACEMENT}'s list of core's chapters ${problems.join('; ')}`);
  }

  return listed;
};

/** the abstract block a block's card extends, if any; the Constitution's check sees every card opens with its front matter */
const baseOf = (layer: string, id: string): string | undefined =>
  cardModel.parse(
    parse(
      // Stryker disable next-line OptionalChaining,StringLiteral: a card without front matter fails the model either way, and Bun reads text whatever the encoding names
      FRONT_MATTER.exec(readFileSync(inBlocks(layer, id, `${id}${MARKDOWN}`), 'utf8'))?.[1] ?? '',
    ),
  ).extends;

/** a layer's blocks, each a folder, in the order the site lists them */
const layerBlocksOf = (layer: string): readonly string[] =>
  readingOrderOf(
    readdirSync(inBlocks(layer)).map((id) => ({
      base: baseOf(layer, id),
      id,
    })),
  );

/** the axes a block's folder may hold beside its root */
const AXES: readonly string[] = [
  'architecture',
  'workflow',
];

/** the axis folders of a layer's blocks, each by its path from blocks/: `<layer>/<id>/<axis>` */
const axisFoldersOf = (layer: string): readonly string[] =>
  readdirSync(inBlocks(layer)).flatMap((id) =>
    AXES.filter((axis) => existsSync(inBlocks(layer, id, axis))).map(
      (axis) => `${layer}/${id}/${axis}`,
    ),
  );

export { axisFoldersOf, coreChaptersOf, layerBlocksOf };
