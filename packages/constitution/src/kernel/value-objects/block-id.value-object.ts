import { reservedWords } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

type BlockId = Brand<string, 'BlockId'>;

const ID_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_PATH = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
const SEGMENT_SEPARATOR = '/';

const isReserved = (segment: string): boolean => reservedWords.has(segment);

const is = (candidate: unknown): candidate is BlockId =>
  typeof candidate === 'string' &&
  ID_PATH.test(candidate) &&
  !candidate.split(SEGMENT_SEPARATOR).some(isReserved);

const isSegment = (name: string): boolean => ID_SEGMENT.test(name) && !isReserved(name);

/**
 * @throws {InvalidValueError} when the text is no block id: kebab-case segments joined by "/",
 * none of them a reserved word
 */
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
  isSegment,
  lastSegmentOf,
  parentOf,
} as const;

const coreBlockId = BlockId.create('core');

export { BlockId, coreBlockId };
