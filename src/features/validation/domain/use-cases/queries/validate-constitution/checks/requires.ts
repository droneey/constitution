import type { Block, Constitution } from '#/features/constitution';
import type { Finding, Layer } from '#/kernel';

import type { Check } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { byIdOf } from '../closure.utils';
import { aBlock, blocksOf, mainPathOf } from '../wording.utils';

interface Subject {
  block: Block;
  byId: BlocksById;
}

const REQUIRABLE: Readonly<Record<Layer, readonly Layer[]>> = {
  core: [],
  domain: [],
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

const requireMessage = (
  input: Subject & {
    id: string;
  },
): string | undefined => {
  const target = input.byId.get(input.id);
  const allowed = REQUIRABLE[input.block.layer];

  if (input.id === 'core') {
    return 'requires core, which is always active';
  }

  if (target === undefined) {
    return `requires ${input.id}, which is not a block`;
  }

  if (target.id === input.block.id) {
    return 'requires itself';
  }

  return allowed.includes(target.layer)
    ? undefined
    : `requires ${input.id}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} requires only ${blocksOf(allowed)}`;
};

const requiresFindings = (subject: Subject): readonly Finding[] =>
  subject.block.frontMatter.requires.flatMap((id) => {
    const message = requireMessage({
      ...subject,
      id,
    });

    return message === undefined
      ? []
      : [
          {
            message,
            path: mainPathOf(subject.block),
          },
        ];
  });

const extendsMessage = (subject: Subject): string | undefined => {
  const base = subject.block.frontMatter.extends;

  if (base === null) {
    return undefined;
  }

  const target = subject.byId.get(base);

  if (target === undefined) {
    return `extends ${base}, which is not a block`;
  }

  if (target.id === subject.block.id) {
    return 'extends itself';
  }

  return target.layer === 'implementation'
    ? undefined
    : `extends ${base}, ${aBlock(target.layer)}; a block extends only an implementation`;
};

const requiresCheck: Check = (
  constitution: Constitution,
): readonly Finding[] => {
  const byId = byIdOf(constitution.blocks);

  return constitution.blocks.flatMap((block) => {
    const extension = extendsMessage({
      block,
      byId,
    });

    return [
      ...requiresFindings({
        block,
        byId,
      }),
      ...(extension === undefined
        ? []
        : [
            {
              message: extension,
              path: mainPathOf(block),
            },
          ]),
    ];
  });
};

export { requiresCheck };
