import type { Block, Constitution } from '#/features/constitution';
import type { Finding, Layer } from '#/kernel';

import type { Check } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { byIdOf } from '../closure.utils';
import { aBlock, blocksOf } from '../wording.utils';

interface Subject {
  block: Block;
  byId: BlocksById;
}

const PAIRABLE: Readonly<Record<Layer, readonly Layer[]>> = {
  core: [],
  domain: [
    'domain',
  ],
  implementation: [
    'domain',
    'platform',
    'language',
    'implementation',
  ],
  language: [
    'domain',
  ],
  platform: [
    'domain',
  ],
};

const MARKDOWN_EXTENSION = '.md';

const pairingMessage = (
  input: Subject & {
    other: string;
  },
): string | undefined => {
  const target = input.byId.get(input.other);
  const allowed = PAIRABLE[input.block.layer];

  if (input.other === input.block.id) {
    return 'is named after its own block';
  }

  if (target === undefined || target.layer === 'core') {
    return `is named after ${input.other}, which is not a block it may pair with`;
  }

  return allowed.includes(target.layer)
    ? undefined
    : `is named after ${input.other}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} pairs only with ${blocksOf(allowed)}`;
};

const pairingFindings = (subject: Subject): readonly Finding[] =>
  subject.block.files
    .filter((file) => file.role === 'with')
    .flatMap((file) => {
      const message = pairingMessage({
        ...subject,
        other: file.with ?? '',
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
      const name = (file.path.split('/').at(-1) ?? '').slice(
        0,
        -MARKDOWN_EXTENSION.length,
      );

      return subject.byId.has(name)
        ? [
            {
              message: `takes the id of the block ${name}; a file named after a block belongs in with/`,
              path: file.path,
            },
          ]
        : [];
    });

const seamsCheck: Check = (constitution: Constitution): readonly Finding[] => {
  const byId = byIdOf(constitution.blocks);

  return constitution.blocks.flatMap((block) => [
    ...pairingFindings({
      block,
      byId,
    }),
    ...chapterFindings({
      block,
      byId,
    }),
  ]);
};

export { seamsCheck };
