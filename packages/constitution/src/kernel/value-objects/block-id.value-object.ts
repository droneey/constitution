import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

type BlockId = Brand<string, 'BlockId'>;

// A block's folder and its front matter name it in kebab-case; an abstract block's id opens with "_".
const KEBAB_CASE_ID = /^_?[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ABSTRACT_MARK = '_';

const is = (candidate: unknown): candidate is BlockId =>
  typeof candidate === 'string' && KEBAB_CASE_ID.test(candidate);

/** @throws {@link InvalidValueError} when the text is no kebab-case block id */
const create = (text: string): BlockId => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.BlockId,
      details: {
        text,
      },
    });
  }

  return text;
};

const equals = (left: BlockId, right: BlockId): boolean => left === right;

const isAbstract = (id: BlockId): boolean => id.startsWith(ABSTRACT_MARK);

const BlockId = {
  create,
  equals,
  is,
  isAbstract,
} as const;

const coreBlockId = BlockId.create('core');

export { BlockId, coreBlockId };
