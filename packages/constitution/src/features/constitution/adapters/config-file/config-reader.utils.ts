import type { ConfigItem, ConfigOverride, ConfigPlace } from '../../domain/entities';
import { closingBracketOf, flowItemsOf, refusal, scalarOf, trimBlanks } from './scalars.utils';

// The state of one read of constitution.yaml, and the lines of a list or of overrides, at the top
// level, depth 0, or in a package, depth 1.

enum Kind {
  None = '',
  List = 'list',
  Done = 'done',
  Overrides = 'overrides',
  Packages = 'packages',
  Scalar = 'scalar',
  Skip = 'skip',
}

type Depth = 0 | 1;

interface Level {
  hasItems: boolean;
  key: string;
  kind: Kind;
}

interface OpenOverride {
  readonly app: string;
  readonly fields: Map<string, string>;
  readonly indent: number;
  readonly line: number;
}

interface Pending extends ConfigPlace {
  readonly indent: number;
  readonly line: number;
  text: string;
}

interface ReaderState {
  app: string;
  readonly apps: string[];
  check: string | undefined;
  readonly empties: ConfigPlace[];
  readonly items: ConfigItem[];
  readonly keys: string[];
  readonly levels: [
    Level,
    Level,
  ];
  line: number;
  readonly lists: ConfigPlace[];
  open: OpenOverride | undefined;
  readonly overrides: ConfigOverride[];
  pending: Pending | undefined;
}

const FIELDS: ReadonlySet<string> = new Set([
  'rule',
  'level',
  'reason',
  'until',
]);
const OVERRIDES = 'overrides';
const ITEM = /^-( |$)/;
const LOWER_KEY = /^[a-z]+:/;
const AFTER_KEY = /^[ \t]/;
const EMPTY_FLOW_LIST = /^\[ *\]$/;
const APP_KEY_INDENT = 4;

// Stryker disable BooleanLiteral,ObjectLiteral,StringLiteral: a level is read only after a key opens it, which sets each of its fields
const closedLevel = (): Level => ({
  hasItems: false,
  key: '',
  kind: Kind.None,
});
// Stryker restore BooleanLiteral,ObjectLiteral,StringLiteral

const createReaderState = (): ReaderState => ({
  app: '',
  apps: [],
  check: undefined,
  empties: [],
  items: [],
  keys: [],
  levels: [
    closedLevel(),
    closedLevel(),
  ],
  line: 0,
  lists: [],
  open: undefined,
  overrides: [],
  pending: undefined,
});

// "<key>:" and what follows it, which is empty or opens with a blank.
const keyedOf = (input: {
  pattern: RegExp;
  text: string;
}): {
  key: string;
  rest: string;
} => {
  const [head = ''] = input.pattern.exec(input.text) ?? [];
  // the text is trimmed and never empty, so with no key the rest is all of it, which opens with no
  // blank and is refused below
  const rest = input.text.slice(head.length);

  if (rest !== '' && !AFTER_KEY.test(rest)) {
    throw refusal();
  }

  return {
    key: head.slice(0, -1),
    rest,
  };
};

const flowList = (input: { place: ConfigPlace; state: ReaderState; text: string }): void => {
  for (const text of flowItemsOf(input.text)) {
    input.state.items.push({
      ...input.place,
      text,
    });
  }
};

const openList = (input: {
  depth: Depth;
  place: ConfigPlace;
  rest: string;
  state: ReaderState;
}): void => {
  const { place, rest, state } = input;
  const level = state.levels[input.depth];

  state.lists.push(place);
  level.key = place.key;
  level.hasItems = false;
  level.kind = rest === '' ? Kind.List : Kind.Done;

  if (rest === '') {
    return;
  }

  if (!rest.startsWith('[')) {
    throw refusal();
  }

  if (closingBracketOf(rest) === -1) {
    state.pending = {
      ...place,
      indent: input.depth === 1 ? APP_KEY_INDENT : 0,
      line: state.line,
      text: rest,
    };

    return;
  }

  flowList({
    place,
    state,
    text: rest,
  });
};

const openOverrides = (input: { depth: Depth; rest: string; state: ReaderState }): void => {
  const level = input.state.levels[input.depth];

  level.key = OVERRIDES;
  level.hasItems = false;

  // "[]" leaves the level closed: it holds no override
  if (input.rest === '') {
    level.kind = Kind.Overrides;
  } else if (!EMPTY_FLOW_LIST.test(input.rest)) {
    throw refusal();
  }
};

const flushOverride = (state: ReaderState): void => {
  const { open } = state;

  if (open !== undefined) {
    state.overrides.push({
      app: open.app,
      level: open.fields.get('level') ?? '',
      line: open.line,
      reason: open.fields.get('reason') ?? '',
      rule: open.fields.get('rule') ?? '',
      until: open.fields.get('until') ?? '',
    });
  }

  state.open = undefined;
};

const readField = (input: { open: OpenOverride; text: string }): void => {
  const { key, rest } = keyedOf({
    pattern: LOWER_KEY,
    text: input.text,
  });

  if (!FIELDS.has(key) || input.open.fields.has(key)) {
    throw refusal();
  }

  input.open.fields.set(key, scalarOf(rest));
};

const readOverride = (input: {
  depth: Depth;
  indent: number;
  state: ReaderState;
  text: string;
}): void => {
  const { state } = input;

  if (!ITEM.test(input.text)) {
    // Stryker disable next-line ConditionalExpression: with no override open, reading its indent throws, which the parser reads as the same refusal
    if (state.open === undefined || input.indent !== state.open.indent + 2) {
      throw refusal();
    }

    readField({
      open: state.open,
      text: input.text,
    });

    return;
  }

  flushOverride(state);

  const open: OpenOverride = {
    app: state.app,
    fields: new Map(),
    indent: input.indent,
    line: state.line,
  };
  const rest = trimBlanks(input.text.slice(1));

  state.open = open;
  state.levels[input.depth].hasItems = true;

  if (rest !== '') {
    readField({
      open,
      text: rest,
    });
  }
};

// A line inside a list or overrides at the depth; any other line leaves the grammar.
const readBody = (input: {
  depth: Depth;
  indent: number;
  state: ReaderState;
  text: string;
}): void => {
  const { state, text } = input;
  const level = state.levels[input.depth];

  if (level.kind === Kind.Skip) {
    return;
  }

  if (level.kind === Kind.Overrides) {
    readOverride(input);

    return;
  }

  const listed = trimBlanks(text.slice(1));

  if (level.kind !== Kind.List || !ITEM.test(text) || listed === '') {
    throw refusal();
  }

  state.items.push({
    app: state.app,
    key: level.key,
    text: scalarOf(listed),
  });
  level.hasItems = true;
};

const closeLevel = (input: { depth: Depth; state: ReaderState }): void => {
  const { state } = input;
  const level = state.levels[input.depth];

  // an override is open only in a level of overrides
  flushOverride(state);

  if ((level.kind === Kind.List || level.kind === Kind.Overrides) && !level.hasItems) {
    state.empties.push({
      app: state.app,
      key: level.key,
    });
  }

  level.kind = Kind.None;
};

export type { Pending, ReaderState };
export {
  closeLevel,
  createReaderState,
  flowList,
  ITEM,
  Kind,
  keyedOf,
  LOWER_KEY,
  openList,
  openOverrides,
  readBody,
};
