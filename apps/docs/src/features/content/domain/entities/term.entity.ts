import { InvalidValueError, ValueFailure } from '../errors';
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
  /** the page that defines it, and the anchor of its rule when a rule does */
  readonly address: string;
  readonly axis: Axis;
  readonly block: string;
  readonly kind: TermKind;
  readonly name: string;
  /** in Markdown */
  readonly sentence: string;
}

const PATH_SEPARATOR = '/';
const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z*`[(])/g;

/** a passport's axis is foundation's, and a seam's is the folder it sits in */
const axisOf = (path: string): Axis =>
  path.split(PATH_SEPARATOR).find(Block.isAxis) ?? Axis.Foundation;

/** the folder that holds the passport, from a path below the blocks folder */
const blockOf = (path: string): string | undefined => {
  const segments = path.split(PATH_SEPARATOR);
  const axis = segments.findIndex(Block.isAxis);

  return axis === -1 ? segments.at(-2) : segments[axis - 1];
};

/** the sentence of `text` that holds the character at `offset` */
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
    block: input.block,
    kind: input.kind,
    name: input.name,
    sentence: input.sentence,
  };
};

const termKinds: readonly string[] = Object.values(TermKind);

const is = (candidate: unknown): candidate is Term =>
  candidate instanceof Object &&
  [
    'address',
    'block',
    'name',
    'sentence',
  ].every((field) => typeof Reflect.get(candidate, field) === 'string') &&
  termKinds.includes(String(Reflect.get(candidate, 'kind'))) &&
  Block.isAxis(String(Reflect.get(candidate, 'axis')));

const equals = (left: Term, right: Term): boolean => left.name === right.name;

/** by name, whatever its case, and by its case where two names differ only there */
const compare = (left: Term, right: Term): number =>
  left.name.toLowerCase().localeCompare(right.name.toLowerCase(), 'en') ||
  left.name.localeCompare(right.name, 'en');

const Term = {
  axisOf,
  blockOf,
  compare,
  create,
  equals,
  is,
  sentenceAround,
} as const;

export { Term, TermKind };
