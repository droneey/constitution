import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { RuleHeading } from '@droneey/constitution';
import { fromMarkdown } from 'mdast-util-from-markdown';

import { MARKDOWN_EXTENSION } from '../../../domain/constants';
import type { BlockLayer } from '../../../domain/entities';
import { Page } from '../../../domain/entities';
import { SourceError, SourceFailure } from '../../../domain/errors';
import type { AbsolutePath } from '../../../domain/value-objects';
import { BlockPath } from '../../../domain/value-objects';
import { headingTextOf, isHeading, SUBSECTION_HEADING_DEPTH } from '../markdown';
import type { BlocksOptions } from './remark-blocks.adapter';

const ruleSlugsIn = (markdown: string): readonly string[] =>
  fromMarkdown(markdown).children.flatMap((node) => {
    const rule = isHeading(node, SUBSECTION_HEADING_DEPTH)
      ? RuleHeading.of(headingTextOf(node))
      : undefined;

    return rule === undefined
      ? []
      : [
          rule.slug,
        ];
  });

const blockPathsIn = (blocksFolderPath: AbsolutePath, layer: BlockLayer): readonly BlockPath[] =>
  readdirSync(join(blocksFolderPath, layer), {
    recursive: true,
  })
    .map((filePath) => `${layer}/${String(filePath)}`)
    .filter(BlockPath.is);

interface BlocksOptionsInput {
  readonly baseUrl: string;
  readonly blocksFolderPath: AbsolutePath;
  readonly examplesFolderPath: AbsolutePath;
  readonly layers: readonly BlockLayer[];
}

/** @throws {SourceError} when an example names no rule of the folders */
const blocksOptionsOf = (input: BlocksOptionsInput): BlocksOptions => {
  const addressesBySlug = new Map<string, string>();

  for (const blockPath of input.layers.flatMap((layer) =>
    blockPathsIn(input.blocksFolderPath, layer),
  )) {
    const pageAddress = Page.addressOf(input.baseUrl, blockPath);

    // Stryker disable next-line StringLiteral: Bun reads text whatever the encoding names
    for (const slug of ruleSlugsIn(readFileSync(join(input.blocksFolderPath, blockPath), 'utf8'))) {
      addressesBySlug.set(slug, `${pageAddress}#${slug}`);
    }
  }

  const exampleFileNames = readdirSync(input.examplesFolderPath).filter((fileName) =>
    fileName.endsWith(MARKDOWN_EXTENSION),
  );
  const unknownSlugs = exampleFileNames
    .map((fileName) => basename(fileName, MARKDOWN_EXTENSION))
    .filter((slug) => !addressesBySlug.has(slug))
    .toSorted();

  if (unknownSlugs.length > 0) {
    throw new SourceError({
      code: SourceFailure.ExampleRuleUnknown,
      details: {
        slugs: unknownSlugs,
      },
    });
  }

  return {
    addressesBySlug,
    examplesBySlug: new Map(
      exampleFileNames.map((fileName) => [
        basename(fileName, MARKDOWN_EXTENSION),
        readFileSync(join(input.examplesFolderPath, fileName), 'utf8'),
      ]),
    ),
  };
};

export { blocksOptionsOf };
