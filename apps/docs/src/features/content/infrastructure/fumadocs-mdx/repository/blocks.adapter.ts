import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';

import {
  axisFoldersAmong,
  axisOfFolder,
  BlockLayer,
  listedChaptersOf,
} from '../../../domain/block/entities';
import { MARKDOWN_EXTENSION, PATH_SEPARATOR } from '../../../domain/shared/constants';
import { AbsolutePath } from '../../../domain/source/value-objects';
import { AXIS_ITEM, corePassportFileName, SEAMS_FOLDER } from './blocks.constants';
import { inRepository } from './repository.adapter';
import { blocksFolderPath } from './repository.constants';

const inBlocks = (...segments: string[]): AbsolutePath =>
  AbsolutePath.create(join(inRepository(blocksFolderPath), ...segments));

const linksIn = (node: Nodes): readonly string[] => [
  ...(node.type === 'link'
    ? [
        node.url,
      ]
    : []),
  ...('children' in node ? node.children.flatMap(linksIn) : []),
];

const coreChaptersOnDisk = (): readonly string[] =>
  readdirSync(inBlocks(BlockLayer.Core), {
    recursive: true,
  })
    .map(String)
    .filter(
      (filePath) => filePath.endsWith(MARKDOWN_EXTENSION) && filePath !== corePassportFileName,
    )
    .map((filePath) => filePath.slice(0, -MARKDOWN_EXTENSION.length));

/** @throws {SourceError} when the chapters core's passport lists and those on disk differ */
const coreChaptersOf = (): readonly string[] =>
  listedChaptersOf({
    chapters: coreChaptersOnDisk(),
    listed: readFileSync(inBlocks(BlockLayer.Core, corePassportFileName), 'utf8')
      .split('\n')
      .filter((line) => AXIS_ITEM.test(line))
      .flatMap((line) => linksIn(fromMarkdown(line)))
      .map((url) => url.slice(0, -MARKDOWN_EXTENSION.length)),
  });

const layerBlocksOf = (layer: BlockLayer): readonly string[] =>
  readdirSync(inBlocks(layer)).toSorted();

const blockFoldersIn = (layer: BlockLayer): readonly string[] =>
  readdirSync(inBlocks(layer), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => relative(inBlocks(), join(entry.parentPath, entry.name)))
    .filter((folder) =>
      folder.split(PATH_SEPARATOR).every((segment) => axisOfFolder(segment) === undefined),
    )
    .toSorted();

const childBlocksOf = (layer: BlockLayer): readonly string[] =>
  blockFoldersIn(layer).filter((folder) => dirname(folder) !== layer);

const axisFoldersOf = (layer: BlockLayer): readonly string[] =>
  blockFoldersIn(layer).flatMap((blockFolder) =>
    axisFoldersAmong(readdirSync(inBlocks(blockFolder))).map(
      (axisFolder) => `${blockFolder}/${axisFolder}`,
    ),
  );

const seamHoldersOf = (layer: BlockLayer): readonly string[] =>
  axisFoldersOf(layer).filter((axisFolder) => existsSync(inBlocks(axisFolder, SEAMS_FOLDER)));

export { axisFoldersOf, childBlocksOf, coreChaptersOf, layerBlocksOf, seamHoldersOf };
