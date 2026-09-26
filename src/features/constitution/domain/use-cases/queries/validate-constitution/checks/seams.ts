import { posix } from 'node:path';

import type { Finding } from '#/kernel';

import type { Block } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { pairableBy } from '../direction.utils';
import { aBlock, blocksOf } from '../wording.utils';

interface Subject {
  block: Block;
  byId: BlocksById;
}

const MARKDOWN_EXTENSION = '.md';

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

  if (target === undefined || target.layer === 'core') {
    return `is named after ${input.other}, which is not a block it may pair with`;
  }

  return allowed.includes(target.layer)
    ? undefined
    : `is named after ${input.other}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} pairs only with ${blocksOf(allowed)}`;
};

const pairingFindings = (subject: Subject): readonly Finding[] =>
  subject.block.files.flatMap((file) => {
    const message =
      file.with === null
        ? undefined
        : pairingMessage({
            ...subject,
            other: file.with,
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
    .filter((file) => file.role === 'chapter')
    .flatMap((file) => {
      const name = posix.basename(file.path, MARKDOWN_EXTENSION);

      return subject.byId.has(name)
        ? [
            {
              message: `takes the id of the block ${name}; a file named after a block belongs in with/`,
              path: file.path,
            },
          ]
        : [];
    });

const seamsCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...pairingFindings({
      block,
      byId,
    }),
    ...chapterFindings({
      block,
      byId,
    }),
  ]);

export { seamsCheck };
