import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { parse } from 'yaml';

import {
  AXIS_FOLDERS,
  chapterListGapsOf,
  MARKDOWN_EXTENSION,
  readingOrderOf,
} from '../../../domain/entities';
import { AXIS_ITEM, corePassport, FRONT_MATTER, SEAMS_FOLDER } from './blocks.constants';
import { passportModel } from './models';
import { inRepository } from './repository.adapter';
import { BLOCKS_FOLDER } from './repository.constants';

const inBlocks = (...parts: string[]): string => inRepository(join(BLOCKS_FOLDER, ...parts));

const linksIn = (node: Nodes): readonly string[] => [
  ...(node.type === 'link'
    ? [
        node.url,
      ]
    : []),
  ...('children' in node ? node.children.flatMap(linksIn) : []),
];

const coreChapterFilesOf = (): readonly string[] =>
  readdirSync(inBlocks('core'), {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith(MARKDOWN_EXTENSION) && path !== corePassport)
    .map((path) => path.slice(0, -MARKDOWN_EXTENSION.length));

/** in the order core's passport lists them; throws when that list and the chapters on disk differ */
const coreChaptersOf = (): readonly string[] => {
  const listed = readFileSync(inBlocks('core', corePassport), 'utf8')
    .split('\n')
    .filter((line) => AXIS_ITEM.test(line))
    .flatMap((line) => linksIn(fromMarkdown(line)))
    .map((url) => url.slice(0, -MARKDOWN_EXTENSION.length));
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
    throw new Error(`${corePassport}'s list of core's chapters ${problems.join('; ')}`);
  }

  return listed;
};

const passportPathOf = (layer: string, id: string): string =>
  inBlocks(layer, id, `${id}${MARKDOWN_EXTENSION}`);

/** the Constitution's check sees every passport opens with its front matter */
const extendedBlockOf = (layer: string, id: string): string | undefined =>
  passportModel.parse(
    parse(
      // Stryker disable next-line OptionalChaining,StringLiteral: a passport without front matter fails the model either way, and Bun reads text whatever the encoding names
      FRONT_MATTER.exec(readFileSync(passportPathOf(layer, id), 'utf8'))?.[1] ?? '',
    ),
  ).extends;

const layerBlocksOf = (layer: string): readonly string[] =>
  readingOrderOf(
    readdirSync(inBlocks(layer)).map((id) => ({
      extends: extendedBlockOf(layer, id),
      id,
    })),
  );

const axisFoldersOf = (layer: string): readonly string[] =>
  readdirSync(inBlocks(layer)).flatMap((id) =>
    AXIS_FOLDERS.filter((axis) => existsSync(inBlocks(layer, id, axis))).map(
      (axis) => `${layer}/${id}/${axis}`,
    ),
  );

const seamHoldersOf = (layer: string): readonly string[] =>
  axisFoldersOf(layer).filter((folder) => existsSync(inBlocks(folder, SEAMS_FOLDER)));

export { axisFoldersOf, coreChaptersOf, layerBlocksOf, seamHoldersOf };
