import { InvalidValueError, ValueFailure } from '../errors';
import { Axis, Block } from './block.entity';

/** the grammar the Constitution's check reads a definition by */
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

interface TermName {
  readonly kind: TermKind;
  readonly name: string;
}

const CONCEPT = /^[a-z]+(?:[ -][a-z]+)*$/;
const LEAD_IN_END = /[.:]$/;
const FILE_NAME = /^[\w-]+(?:\.[\w-]+)+$/;
const FOLDER_END = '/';
const SUFFIX_START = '.';
const PATH_SEPARATOR = '/';
const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z*`[(])/g;
const WHITESPACE = /\s+/g;

const codeKindOf = (name: string): TermKind => {
  if (name.endsWith(FOLDER_END)) {
    return TermKind.Folder;
  }

  if (name.startsWith(SUFFIX_START)) {
    return TermKind.Suffix;
  }

  return FILE_NAME.test(name) ? TermKind.File : TermKind.Api;
};

// A lead-in closes on "." or ":" and opens its sentence, so a capital that opens it is the
// sentence's, not the term's.
const plainNameOf = (text: string): TermName => {
  const words = text.replaceAll(WHITESPACE, ' ');
  const isLeadIn = LEAD_IN_END.test(words);
  const name = isLeadIn ? words.slice(0, -1) : words;
  const lowered = isLeadIn ? `${name.charAt(0).toLowerCase()}${name.slice(1)}` : name;

  return CONCEPT.test(lowered)
    ? {
        kind: TermKind.Concept,
        name: lowered,
      }
    : {
        kind: TermKind.Brand,
        name,
      };
};

/** the term a bold span defines: one code span, or plain words */
const nameOf = (bold: { isCode: boolean; text: string }): TermName =>
  bold.isCode
    ? {
        kind: codeKindOf(bold.text),
        name: bold.text,
      }
    : plainNameOf(bold.text);

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
  nameOf,
  sentenceAround,
} as const;

export { Term, TermKind };
