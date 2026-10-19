import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { parse } from 'yaml';

import { AXIS_FOLDERS, chapterListGapsOf, readingOrderOf } from '../../../domain/utils';
import { passportModel } from './models';
import { BLOCKS_FOLDER, inRepository } from './repository.adapter';

const MARKDOWN = '.md';

/** core's passport, whose list of core's chapters gives the order they are read in */
const PASSPORT = `core${MARKDOWN}`;

/** an item of that list, which opens with its axis folder: "- `foundation/`: …" */
const AXIS_ITEM = /^- `[a-z]+\/`:/;

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

/** core's chapters by their paths in core's folder, without `.md`; its passport, `core.md`, left out */
const coreChapterFilesOf = (): readonly string[] =>
  readdirSync(inBlocks('core'), {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith(MARKDOWN) && path !== PASSPORT)
    .map((path) => path.slice(0, -MARKDOWN.length));

/** core's chapters in the order its passport lists them, which a chapter added without a place in that list stops */
const coreChaptersOf = (): readonly string[] => {
  const listed = readFileSync(inBlocks('core', PASSPORT), 'utf8')
    .split('\n')
    .filter((line) => AXIS_ITEM.test(line))
    .flatMap((line) => linksIn(fromMarkdown(line)))
    .map((url) => url.slice(0, -MARKDOWN.length));
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
    throw new Error(`${PASSPORT}'s list of core's chapters ${problems.join('; ')}`);
  }

  return listed;
};

/** the abstract block a block's passport extends, if any; the Constitution's check sees every passport opens with its front matter */
const baseOf = (layer: string, id: string): string | undefined =>
  passportModel.parse(
    parse(
      // Stryker disable next-line OptionalChaining,StringLiteral: a passport without front matter fails the model either way, and Bun reads text whatever the encoding names
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

/** the axis folders of a layer's blocks, each by its path from blocks/: `<layer>/<id>/<axis>` */
const axisFoldersOf = (layer: string): readonly string[] =>
  readdirSync(inBlocks(layer)).flatMap((id) =>
    AXIS_FOLDERS.filter((axis) => existsSync(inBlocks(layer, id, axis))).map(
      (axis) => `${layer}/${id}/${axis}`,
    ),
  );

/** the folder of an axis's seams */
const SEAMS = 'with';

/** the axis folders of a layer's blocks that hold seams, each by its path from blocks/ */
const seamHoldersOf = (layer: string): readonly string[] =>
  axisFoldersOf(layer).filter((folder) => existsSync(inBlocks(folder, SEAMS)));

export { axisFoldersOf, coreChaptersOf, layerBlocksOf, SEAMS, seamHoldersOf };
