import { PATH_SEPARATOR } from '../constants';
import { InvalidValueError, ValueFailure } from '../errors';
import type { BlockPath } from '../value-objects';
import { Axis, Block } from './block.entity';

/** what a term names, as the Constitution's grammar reads a definition */
enum TermKind {
  Concept = 'concept',
  Brand = 'brand',
  Folder = 'folder',
  Suffix = 'suffix',
  File = 'file',
  Api = 'api',
}

interface Term {
  /** the page that defines it, with the anchor of its id, else of its rule when a rule defines it */
  readonly address: string;
  readonly axis: Axis;
  readonly blockId: string;
  readonly kind: TermKind;
  readonly name: string;
  /** in Markdown */
  readonly sentence: string;
}

const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z*`[(])/g;

/** a passport's axis is foundation's, and a seam's is the folder it sits in */
const axisOf = (blockPath: BlockPath): Axis =>
  blockPath.split(PATH_SEPARATOR).find(Block.isAxis) ?? Axis.Foundation;

/** undefined for a file at the root of the blocks folder */
const blockIdOf = (blockPath: BlockPath): string | undefined => {
  const segments = blockPath.split(PATH_SEPARATOR);
  const axisIndex = segments.findIndex(Block.isAxis);

  return axisIndex === -1 ? segments.at(-2) : segments[axisIndex - 1];
};

const sentenceAround = (input: { offset: number; text: string }): string => {
  const breaks = [
    ...input.text.matchAll(SENTENCE_BREAK),
  ];
  const before = breaks.filter((found) => found.index < input.offset).at(-1);
  const after = breaks.find((found) => found.index >= input.offset);

  return input.text
    .slice(
      before === undefined ? 0 : before.index + before[0].length,
      after === undefined ? input.text.length : after.index,
    )
    .trim();
};

/** @throws {@link InvalidValueError} when the name is empty */
const create = (input: Term): Term => {
  if (input.name.trim() === '') {
    throw new InvalidValueError({
      code: ValueFailure.TermNameEmpty,
      details: {
        value: input.name,
      },
    });
  }

  return {
    address: input.address,
    axis: input.axis,
    blockId: input.blockId,
    kind: input.kind,
    name: input.name,
    sentence: input.sentence,
  };
};

/** by name, whatever its case, and by its case where two names differ only there */
const compare = (left: Term, right: Term): number =>
  left.name.toLowerCase().localeCompare(right.name.toLowerCase(), 'en') ||
  left.name.localeCompare(right.name, 'en');

const Term = {
  axisOf,
  blockIdOf,
  compare,
  create,
  sentenceAround,
} as const;

export { Term, TermKind };
