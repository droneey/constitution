import { posix } from 'node:path';

import type { Finding } from '#/kernel';
import { inlineCodeSpans, withoutCodeFences } from '#/libs/markdown';

import type { Block, BlockFile, Rule } from '../../../../entities';
import { resolveLink } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { linkTargetsOf } from '../link-targets.utils';

const IMPLEMENTS_LINE = /^\*\*Implements:\*\*/;
const TABLE_ROW = /^\s*\|/;
const FOLDER_SEPARATOR = '/';

const ownerOf = (input: {
  blocks: readonly Block[];
  target: string;
}): Block | undefined =>
  input.blocks.find((block) => {
    const folder = posix.dirname(block.path);

    return (
      input.target === folder ||
      input.target.startsWith(`${folder}${FOLDER_SEPARATOR}`)
    );
  });

const linkFindings = (input: {
  block: Block;
  blocks: readonly Block[];
  file: BlockFile;
}): readonly Finding[] =>
  linkTargetsOf(input.file.body).flatMap((target) => {
    const owner = ownerOf({
      blocks: input.blocks,
      target: resolveLink({
        path: input.file.path,
        target,
      }),
    });

    return owner === undefined || owner.id === input.block.id
      ? []
      : [
          {
            message: `links to ${target}, a file of the block ${owner.id}; a block refers to another only through its front matter and with/ file names`,
            path: input.file.path,
          },
        ];
  });

// The Implements line and the rows of a Requirements table are the two places
// that name a rule of another block; everywhere else a slug is a reference.
const slugFindings = (input: {
  block: Block;
  file: BlockFile;
  slugs: ReadonlyMap<string, Rule>;
}): readonly Finding[] => {
  const prose = withoutCodeFences(input.file.body)
    .split('\n')
    .filter((line) => !(IMPLEMENTS_LINE.test(line) || TABLE_ROW.test(line)))
    .join('\n');

  return [
    ...new Set(inlineCodeSpans(prose)),
  ].flatMap((span) => {
    const rule = input.slugs.get(span);

    return rule === undefined || rule.block === input.block.id
      ? []
      : [
          {
            message: `names the rule ${span} of ${rule.block}; a rule refers to another only through its Implements line`,
            path: input.file.path,
          },
        ];
  });
};

const referencesCheck: Check = ({
  constitution,
}: CheckInput): readonly Finding[] => {
  const slugs = new Map(
    constitution.rules.map((rule) => [
      rule.slug,
      rule,
    ]),
  );

  return constitution.blocks.flatMap((block) =>
    block.files.flatMap((file) => [
      ...linkFindings({
        block,
        blocks: constitution.blocks,
        file,
      }),
      ...slugFindings({
        block,
        file,
        slugs,
      }),
    ]),
  );
};

export { referencesCheck };
