import { Layer } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';

import type { Block, BlockFile } from '../../../../entities';
import { BlockFileRole } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { stemOf } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { pairableBy } from '../direction.utils';
import { aBlock, blocksOf } from '../wording.utils';

interface Subject {
  block: Block;
  byId: BlocksById;
}

const MARKDOWN_EXTENSION = '.md';

const TITLE = '# ';

/** a file's title line, its first first-level heading */
const titleOf = (body: string): string | undefined =>
  body.split('\n').find((line) => line.startsWith(TITLE));

const pairingMessage = (
  input: Subject & {
    other: string;
  },
): string | undefined => {
  const target = input.byId.get(input.other);
  const allowed = pairableBy(input.block.layer);

  if (input.other === input.block.id) {
    return 'is named after its own block';
  }

  if (allowed.length === 0) {
    return `is a with/ file of ${input.block.id}, which pairs with no block`;
  }

  if (target === undefined || target.layer === Layer.Core) {
    return `is named after ${input.other}, which is not a block it may pair with`;
  }

  return allowed.includes(target.layer)
    ? undefined
    : `is named after ${input.other}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} pairs only with ${blocksOf(allowed)}`;
};

/** a seam titled otherwise than the other block's card, since the seam's folder already names the block it belongs to */
const titleMessage = (input: { file: BlockFile; other: Block | undefined }): string | undefined => {
  // Stryker disable next-line OptionalChaining,StringLiteral: a sound pair's other block is loaded, and its first file is its card
  const expected = titleOf(input.other?.files[0]?.body ?? '');

  return titleOf(input.file.body) === expected
    ? undefined
    : "is titled otherwise than the other block's card, whose title a seam takes";
};

const seamFindings = (subject: Subject): readonly Finding[] =>
  subject.block.files.flatMap((file) => {
    if (file.with === undefined) {
      return [];
    }

    const message =
      pairingMessage({
        ...subject,
        other: file.with,
      }) ??
      titleMessage({
        file,
        other: subject.byId.get(file.with),
      });

    return message === undefined
      ? []
      : [
          {
            message,
            path: file.path,
          },
        ];
  });

const chapterFindings = (subject: Subject): readonly Finding[] =>
  subject.block.files
    .filter((file) => file.role === BlockFileRole.Chapter)
    .flatMap((file) => {
      const name = stemOf({
        extension: MARKDOWN_EXTENSION,
        path: file.path,
      });

      return name !== subject.block.id && subject.byId.has(name)
        ? [
            {
              message: `takes the id of the block ${name}; a file named after a block belongs in with/`,
              path: file.path,
            },
          ]
        : [];
    });

const seamsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...seamFindings({
      block,
      byId,
    }),
    ...chapterFindings({
      block,
      byId,
    }),
  ]);

export { seamsCheck };
