import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { RuleHeading } from '@droneey/constitution';

import { MARKDOWN_EXTENSION, pageSlugsOf } from '../../../domain/entities';
import type { BlocksOptions } from './remark-blocks.adapter';

const RULE_MARK = '### ';

const ruleSlugsIn = (markdown: string): readonly string[] =>
  markdown.split('\n').flatMap((line) => {
    const rule = line.startsWith(RULE_MARK)
      ? RuleHeading.of(line.slice(RULE_MARK.length))
      : undefined;

    return rule === undefined
      ? []
      : [
          rule.slug,
        ];
  });

const markdownFilesOf = (root: string, folder: string): readonly string[] =>
  readdirSync(join(root, folder), {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith(MARKDOWN_EXTENSION))
    .map((path) => `${folder}/${path}`);

interface BlocksOptionsInput {
  readonly baseUrl: string;
  readonly blocks: string;
  readonly examples: string;
  readonly folders: readonly string[];
}

const blocksOptionsOf = (input: BlocksOptionsInput): BlocksOptions => {
  const addresses = new Map<string, string>();

  for (const path of input.folders.flatMap((folder) => markdownFilesOf(input.blocks, folder))) {
    const page = [
      input.baseUrl,
      ...pageSlugsOf(path),
    ].join('/');

    for (const slug of ruleSlugsIn(readFileSync(join(input.blocks, path), 'utf8'))) {
      addresses.set(slug, `${page}#${slug}`);
    }
  }

  const files = readdirSync(input.examples).filter((name) => name.endsWith(MARKDOWN_EXTENSION));
  const unknown = files
    .map((name) => basename(name, MARKDOWN_EXTENSION))
    .filter((slug) => !addresses.has(slug));

  if (unknown.length > 0) {
    throw new Error(`examples name no rule: ${unknown.join(', ')}`);
  }

  return {
    addresses,
    examples: new Map(
      files.map((name) => [
        basename(name, MARKDOWN_EXTENSION),
        readFileSync(join(input.examples, name), 'utf8'),
      ]),
    ),
  };
};

export { blocksOptionsOf };
