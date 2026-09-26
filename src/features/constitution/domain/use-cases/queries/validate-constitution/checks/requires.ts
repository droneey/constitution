import type { Finding, Layer } from '#/kernel';

import type { Block } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';
import { requirableBy } from '../direction.utils';
import { aBlock, blocksOf } from '../wording.utils';

interface Subject {
  block: Block;
  byId: BlocksById;
}

const requireMessage = (
  input: Subject & {
    allowed: readonly Layer[];
    id: string;
  },
): string | undefined => {
  const target = input.byId.get(input.id);

  if (input.id === 'core') {
    return 'requires core, which is always active';
  }

  if (target === undefined) {
    return `requires ${input.id}, which is not a block`;
  }

  if (target.id === input.block.id) {
    return 'requires itself';
  }

  return input.allowed.includes(target.layer)
    ? undefined
    : `requires ${input.id}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} requires only ${blocksOf(input.allowed)}`;
};

const extendsMessage = (subject: Subject): string | undefined => {
  const base = subject.block.frontMatter.extends;
  const target = base === undefined ? undefined : subject.byId.get(base);

  if (base === undefined) {
    return undefined;
  }

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

// A layer that requires or extends nothing leaves the fields empty; the
// front-matter check reports a filled one, so this check skips those layers.
const blockFindings = (subject: Subject): readonly Finding[] => {
  const allowed = requirableBy(subject.block.layer);
  const messages = [
    ...(allowed.length === 0
      ? []
      : subject.block.frontMatter.requires.map((id) =>
          requireMessage({
            ...subject,
            allowed,
            id,
          }),
        )),
    subject.block.layer === 'implementation'
      ? extendsMessage(subject)
      : undefined,
  ];

  return messages.flatMap((message) =>
    message === undefined
      ? []
      : [
          {
            message,
            path: subject.block.path,
          },
        ],
  );
};

const requiresCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      byId,
    }),
  );

export { requiresCheck };
