import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fromMarkdown } from 'mdast-util-from-markdown';

import type { BlockLayer } from '../../../domain/block/entities';
import { Page } from '../../../domain/page/entities';
import { BlockPath } from '../../../domain/shared/value-objects';
import type { AbsolutePath } from '../../../domain/source/value-objects';
import { headingTextOf, isHeading, SUBSECTION_HEADING_DEPTH } from '../markdown';
import type { BlocksOptions } from './remark-blocks.adapter';
import { levelledRuleOf } from './remark-blocks.adapter';

const slugsIn = (markdown: string): readonly string[] =>
  fromMarkdown(markdown).children.flatMap((node) =>
    isHeading(node, SUBSECTION_HEADING_DEPTH)
      ? (levelledRuleOf(headingTextOf(node))?.slug ?? [])
      : [],
  );

const blockPathsIn = (blocksFolderPath: AbsolutePath, layer: BlockLayer): readonly BlockPath[] =>
  readdirSync(join(blocksFolderPath, layer), {
    recursive: true,
  })
    .map((filePath) => `${layer}/${String(filePath)}`)
    .filter(BlockPath.is);

interface BlocksOptionsInput {
  readonly baseUrl: string;
  readonly blocksFolderPath: AbsolutePath;
  readonly layers: readonly BlockLayer[];
}

const blocksOptionsOf = (input: BlocksOptionsInput): BlocksOptions => {
  const addressesBySlug = new Map<string, string>();
  const blockPaths = input.layers.flatMap((layer) => blockPathsIn(input.blocksFolderPath, layer));

  for (const blockPath of blockPaths) {
    const pageAddress = Page.addressOf(input.baseUrl, blockPath);

    for (const slug of slugsIn(
      // Stryker disable next-line StringLiteral: Bun reads text whatever the encoding names
      readFileSync(join(input.blocksFolderPath, blockPath), 'utf8'),
    )) {
      addressesBySlug.set(slug, `${pageAddress}#${slug}`);
    }
  }

  return {
    addressesBySlug,
  };
};

export { blocksOptionsOf };
