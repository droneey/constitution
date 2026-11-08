import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { fromMarkdown } from 'mdast-util-from-markdown';

import type { BlockLayer } from '../../../domain/block/entities';
import { Page } from '../../../domain/page/entities';
import { MARKDOWN_EXTENSION } from '../../../domain/shared/constants';
import { BlockPath } from '../../../domain/shared/value-objects';
import { SourceError, SourceFailure } from '../../../domain/source/errors';
import type { AbsolutePath } from '../../../domain/source/value-objects';
import {
  headingTextOf,
  isHeading,
  isSectionHeading,
  PART_HEADING_DEPTH,
  SUBSECTION_HEADING_DEPTH,
} from '../markdown';
import type { BlocksOptions } from './remark-blocks.adapter';
import { levelledRuleOf } from './remark-blocks.adapter';
import { RulePart } from './remark-blocks.constants';

interface RuleRead {
  hasExamples: boolean;
  readonly slug: string;
}

const rulesIn = (markdown: string): readonly RuleRead[] => {
  const rules: RuleRead[] = [];
  let open: RuleRead | undefined;

  for (const node of fromMarkdown(markdown).children) {
    if (isSectionHeading(node)) {
      const rule = isHeading(node, SUBSECTION_HEADING_DEPTH)
        ? levelledRuleOf(headingTextOf(node))
        : undefined;

      open =
        rule === undefined
          ? undefined
          : {
              hasExamples: false,
              slug: rule.slug,
            };

      if (open !== undefined) {
        rules.push(open);
      }
    } else if (
      open !== undefined &&
      isHeading(node, PART_HEADING_DEPTH) &&
      headingTextOf(node) === RulePart.Examples
    ) {
      open.hasExamples = true;
    }
  }

  return rules;
};

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

/** @throws {SourceError} when an example names no rule of the folders, or a rule that holds its own */
const blocksOptionsOf = (input: BlocksOptionsInput): BlocksOptions => {
  const addressesBySlug = new Map<string, string>();
  const exampledSlugs = new Set<string>();
  const blockPaths = input.layers.flatMap((layer) => blockPathsIn(input.blocksFolderPath, layer));

  for (const blockPath of blockPaths) {
    const pageAddress = Page.addressOf(input.baseUrl, blockPath);

    for (const { hasExamples, slug } of rulesIn(
      // Stryker disable next-line StringLiteral: Bun reads text whatever the encoding names
      readFileSync(join(input.blocksFolderPath, blockPath), 'utf8'),
    )) {
      addressesBySlug.set(slug, `${pageAddress}#${slug}`);

      if (hasExamples) {
        exampledSlugs.add(slug);
      }
    }
  }

  const exampleFileNames = existsSync(input.examplesFolderPath)
    ? readdirSync(input.examplesFolderPath).filter((fileName) =>
        fileName.endsWith(MARKDOWN_EXTENSION),
      )
    : [];
  const exampleSlugs = exampleFileNames.map((fileName) => basename(fileName, MARKDOWN_EXTENSION));
  const unknownSlugs = exampleSlugs.filter((slug) => !addressesBySlug.has(slug)).toSorted();

  if (unknownSlugs.length > 0) {
    throw new SourceError({
      code: SourceFailure.ExampleRuleUnknown,
      details: {
        slugs: unknownSlugs,
      },
    });
  }

  const slugsInRules = exampleSlugs.filter((slug) => exampledSlugs.has(slug)).toSorted();

  if (slugsInRules.length > 0) {
    throw new SourceError({
      code: SourceFailure.ExampleInRule,
      details: {
        slugs: slugsInRules,
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
