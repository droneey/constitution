import type { ConfigItem } from '../../domain/entities';
import { ConfigKey, ConfigOverride } from '../../domain/entities';
import { GrammarRefusal } from './errors';
import { closingBracketOf, flowItemsOf, scalarOf, trimBlanks } from './scalars.utils';

enum Kind {
  None = '',
  List = 'list',
  Done = 'done',
  Overrides = 'overrides',
  Scalar = 'scalar',
  Skip = 'skip',
}

interface Level {
  hasItems: boolean;
  key: string;
  kind: Kind;
}

interface OpenOverride {
  readonly fields: Map<string, string>;
  readonly indent: number;
  line: number;
}

interface Pending {
  key: string;
  line: number;
  text: string;
}

interface ReaderState {
  check: string | undefined;
  readonly empties: string[];
  readonly items: ConfigItem[];
  readonly keys: string[];
  readonly level: Level;
  line: number;
  readonly lists: string[];
  open: OpenOverride | undefined;
  readonly overrides: ConfigOverride[];
  pending: Pending | undefined;
}

const fieldNames: ReadonlySet<string> = new Set([
  'rule',
  'level',
  'reason',
  'until',
]);
const ITEM = /^-( |$)/;
const LOWER_KEY = /^[a-z]+:/;
const AFTER_KEY = /^[ \t]/;
const EMPTY_FLOW_LIST = /^\[ *\]$/;

// Stryker disable BooleanLiteral,ObjectLiteral,StringLiteral: a level is read only after a key opens it, which sets each of its fields
const closedLevel = (): Level => ({
  hasItems: false,
  key: '',
  kind: Kind.None,
});
// Stryker restore BooleanLiteral,ObjectLiteral,StringLiteral

const createReaderState = (): ReaderState => ({
  check: undefined,
  empties: [],
  items: [],
  keys: [],
  level: closedLevel(),
  line: 0,
  lists: [],
  open: undefined,
  overrides: [],
  pending: undefined,
});

interface KeyedInput {
  readonly pattern: RegExp;
  readonly text: string;
}

// "<key>:" and what follows it, which is empty or opens with a blank.
const keyedOf = (
  input: KeyedInput,
): {
  key: string;
  rest: string;
} => {
  const [head = ''] = input.pattern.exec(input.text) ?? [];
  // the text is trimmed and never empty, so with no key the rest is all of it, which opens with no
  // blank and is refused below
  const rest = input.text.slice(head.length);

  if (rest !== '' && !AFTER_KEY.test(rest)) {
    throw new GrammarRefusal();
  }

  return {
    key: head.slice(0, -1),
    rest,
  };
};

interface FlowListInput {
  readonly key: string;
  readonly state: ReaderState;
  readonly text: string;
}

const flowList = (input: FlowListInput): void => {
  for (const text of flowItemsOf(input.text)) {
    input.state.items.push({
      key: input.key,
      text,
    });
  }
};

interface OpenListInput {
  readonly key: string;
  readonly rest: string;
  readonly state: ReaderState;
}

const openList = (input: OpenListInput): void => {
  const { key, rest, state } = input;
  const { level } = state;

  state.lists.push(key);
  level.key = key;
  level.hasItems = false;
  level.kind = rest === '' ? Kind.List : Kind.Done;

  if (rest === '') {
    return;
  }

  if (!rest.startsWith('[')) {
    throw new GrammarRefusal();
  }

  if (closingBracketOf(rest) === -1) {
    state.pending = {
      key,
      line: state.line,
      text: rest,
    };

    return;
  }

  flowList({
    key,
    state,
    text: rest,
  });
};

interface OpenOverridesInput {
  readonly rest: string;
  readonly state: ReaderState;
}

const openOverrides = (input: OpenOverridesInput): void => {
  const { level } = input.state;

  level.key = ConfigKey.Overrides;
  level.hasItems = false;

  // "[]" leaves the level closed: it holds no override
  if (input.rest === '') {
    level.kind = Kind.Overrides;
  } else if (!EMPTY_FLOW_LIST.test(input.rest)) {
    throw new GrammarRefusal();
  }
};

const flushOverride = (state: ReaderState): void => {
  const { open } = state;

  if (open !== undefined) {
    const writtenOf = (name: string): string | undefined => {
      const text = open.fields.get(name);

      return text === '' ? undefined : text;
    };

    state.overrides.push(
      ConfigOverride.create({
        level: writtenOf('level'),
        line: open.line,
        reason: writtenOf('reason'),
        rule: writtenOf('rule'),
        until: writtenOf('until'),
      }),
    );
  }

  state.open = undefined;
};

const readField = (input: { open: OpenOverride; text: string }): void => {
  const { key, rest } = keyedOf({
    pattern: LOWER_KEY,
    text: input.text,
  });

  if (!fieldNames.has(key) || input.open.fields.has(key)) {
    throw new GrammarRefusal();
  }

  input.open.fields.set(key, scalarOf(rest));
};

interface ReadLineInput {
  readonly indent: number;
  readonly state: ReaderState;
  readonly text: string;
}

const readOverride = (input: ReadLineInput): void => {
  const { state } = input;

  if (!ITEM.test(input.text)) {
    // Stryker disable next-line ConditionalExpression: with no override open, reading its indent throws, which the parser reads as the same refusal
    if (state.open === undefined || input.indent !== state.open.indent + 2) {
      throw new GrammarRefusal();
    }

    readField({
      open: state.open,
      text: input.text,
    });

    return;
  }

  flushOverride(state);

  const open: OpenOverride = {
    fields: new Map(),
    indent: input.indent,
    line: state.line,
  };
  const rest = trimBlanks(input.text.slice(1));

  state.open = open;
  state.level.hasItems = true;

  if (rest !== '') {
    readField({
      open,
      text: rest,
    });
  }
};

// A line inside a list or overrides; any other line leaves the grammar.
const readBody = (input: ReadLineInput): void => {
  const { state, text } = input;
  const { level } = state;

  if (level.kind === Kind.Skip) {
    return;
  }

  if (level.kind === Kind.Overrides) {
    readOverride(input);

    return;
  }

  const listed = trimBlanks(text.slice(1));

  if (level.kind !== Kind.List || !ITEM.test(text) || listed === '') {
    throw new GrammarRefusal();
  }

  state.items.push({
    key: level.key,
    text: scalarOf(listed),
  });
  level.hasItems = true;
};

const closeLevel = (state: ReaderState): void => {
  const { level } = state;

  // an override is open only in a level of overrides
  flushOverride(state);

  if ((level.kind === Kind.List || level.kind === Kind.Overrides) && !level.hasItems) {
    state.empties.push(level.key);
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
  openList,
  openOverrides,
  readBody,
};
