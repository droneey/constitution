import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { parse } from 'yaml';

import { Block, BlockFormat, BlockLayer } from '../../../domain/block/entities';
import { MARKDOWN_EXTENSION, PATH_SEPARATOR } from '../../../domain/shared/constants';
import { BlockPath } from '../../../domain/shared/value-objects';
import { AbsolutePath } from '../../../domain/source/value-objects';
import { AXIS_ITEM, corePassportFileName, FRONT_MATTER, SEAMS_FOLDER } from './blocks.constants';
import { fileValueOf } from './file-value.adapter';
import { passportModel } from './models';
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
  Block.listedChaptersOf({
    chapters: coreChaptersOnDisk(),
    listed: readFileSync(inBlocks(BlockLayer.Core, corePassportFileName), 'utf8')
      .split('\n')
      .filter((line) => AXIS_ITEM.test(line))
      .flatMap((line) => linksIn(fromMarkdown(line)))
      .map((url) => url.slice(0, -MARKDOWN_EXTENSION.length)),
  });

/** @throws {SourceError} when the passport's front matter names no base it can read */
const baseBlockIdOf = (layer: BlockLayer, id: string): string | undefined => {
  const passportPath = BlockPath.create(`${layer}/${id}/${id}${MARKDOWN_EXTENSION}`);

  return fileValueOf({
    model: passportModel,
    parseYamlOrJson: () =>
      parse(
        // Stryker disable next-line OptionalChaining,StringLiteral: a passport without front matter fails the model either way, and Bun reads text whatever the encoding names
        FRONT_MATTER.exec(readFileSync(inBlocks(passportPath), 'utf8'))?.[1] ?? '',
      ),
    filePath: passportPath,
  }).extends;
};

/** @throws {SourceError} when the passport's front matter names no base it can read */
const legacyBlockOf = (layer: BlockLayer, id: string): Block => {
  const baseId = baseBlockIdOf(layer, id);

  // Stryker disable next-line ConditionalExpression: a block whose base is set to undefined sorts as one with none
  return baseId === undefined
    ? {
        id,
      }
    : {
        extends: baseId,
        id,
      };
};

const formatOnDisk = (): BlockFormat =>
  Block.formatOf(
    readdirSync(inBlocks(), {
      recursive: true,
    }).map(String),
  );

/** @throws {SourceError} when a legacy passport's front matter names no base it can read */
const layerBlocksOf = (layer: BlockLayer): readonly string[] => {
  const format = formatOnDisk();

  return Block.readingOrderOf(
    readdirSync(inBlocks(layer)).map((id) =>
      format === BlockFormat.Nested
        ? {
            id,
          }
        : legacyBlockOf(layer, id),
    ),
  );
};

const blockFoldersIn = (layer: BlockLayer): readonly string[] =>
  readdirSync(inBlocks(layer), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => relative(inBlocks(), join(entry.parentPath, entry.name)))
    .filter((folder) =>
      folder.split(PATH_SEPARATOR).every((segment) => Block.axisOfFolder(segment) === undefined),
    )
    .toSorted();

const childBlocksOf = (layer: BlockLayer): readonly string[] =>
  blockFoldersIn(layer).filter((folder) => dirname(folder) !== layer);

const axisFoldersOf = (layer: BlockLayer): readonly string[] =>
  blockFoldersIn(layer).flatMap((blockFolder) =>
    Block.axisFoldersAmong(readdirSync(inBlocks(blockFolder))).map(
      (axisFolder) => `${blockFolder}/${axisFolder}`,
    ),
  );

const seamHoldersOf = (layer: BlockLayer): readonly string[] =>
  axisFoldersOf(layer).filter((axisFolder) => existsSync(inBlocks(axisFolder, SEAMS_FOLDER)));

export { axisFoldersOf, childBlocksOf, coreChaptersOf, layerBlocksOf, seamHoldersOf };
