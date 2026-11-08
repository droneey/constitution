import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

type BlockId = Brand<string, 'BlockId'>;

const ID_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_PATH =
  /^(?:_[a-z0-9]+(?:-[a-z0-9]+)*|[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)$/;
const ABSTRACT_MARK = '_';
const SEGMENT_SEPARATOR = '/';

const is = (candidate: unknown): candidate is BlockId =>
  typeof candidate === 'string' && ID_PATH.test(candidate);

const isSegment = (name: string): boolean => ID_SEGMENT.test(name);

/** @throws {InvalidValueError} when the text is no block id: kebab-case segments joined by "/" */
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

const lastSegmentOf = (id: BlockId): string =>
  id.slice(id.lastIndexOf(SEGMENT_SEPARATOR) + SEGMENT_SEPARATOR.length);

const parentOf = (id: BlockId): BlockId | undefined => {
  const end = id.lastIndexOf(SEGMENT_SEPARATOR);

  return end === -1 ? undefined : create(id.slice(0, end));
};

const ancestorsOf = (id: BlockId): readonly BlockId[] => {
  const parent = parentOf(id);

  return parent === undefined
    ? []
    : [
        parent,
        ...ancestorsOf(parent),
      ];
};

const BlockId = {
  ancestorsOf,
  create,
  equals,
  is,
  isAbstract,
  isSegment,
  lastSegmentOf,
  parentOf,
} as const;

const coreBlockId = BlockId.create('core');

export { BlockId, coreBlockId };
