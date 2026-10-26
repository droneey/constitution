import { CHECK_KEY } from '#/kernel/constants';
import { ConfigReadStatus } from '#/kernel/entities';
import { recognisedFailure } from '#/kernel/utils';

import type { ConfigParser } from '../../domain/contracts';
import type { ConfigRead } from '../../domain/entities';
import { ConfigKey, LIST_KEYS } from '../../domain/entities';
import type { Pending, ReaderState } from './config-reader.utils';
import {
  closeLevel,
  createReaderState,
  flowList,
  ITEM,
  Kind,
  keyedOf,
  openList,
  openOverrides,
  readBody,
} from './config-reader.utils';
import { GrammarRefusal, isGrammarRefusal } from './errors';
import { closingBracketOf, scalarOf, trimBlanks, withoutComment } from './scalars.utils';

// constitution.yaml in the fixed subset of YAML its grammar allows, read line by line as a person
// reads it: a line outside the subset stops the read there, and the hook gives core alone.

const listKeys: ReadonlySet<string> = new Set(LIST_KEYS);
const MARKER = '---';
const TOP_KEY = /^[A-Za-z_][A-Za-z0-9_-]*:/;
const BLANK_LINE = /^[ \t]*$/;
const TAB_INDENT = /^ *\t/;
const NOT_A_SPACE = /[^ ]/;

interface Reader {
  isMarked: boolean;
  readonly state: ReaderState;
}

// check: null, or YAML's other null, names no check, and name: null no name.
const yamlNulls: ReadonlySet<string> = new Set([
  'null',
  '~',
]);

const openTopValue = (input: { key: string; rest: string; state: ReaderState }): void => {
  const { key, rest, state } = input;

  if (key === CHECK_KEY) {
    const check = scalarOf(rest);

    state.level.kind = Kind.Scalar;

    if (check === '') {
      state.empties.push(CHECK_KEY);
    } else if (!yamlNulls.has(check)) {
      state.check = check;
    }
  } else if (key === ConfigKey.Name) {
    const name = scalarOf(rest);

    state.level.kind = Kind.Scalar;

    // an empty name names no package, as one left out does
    if (name !== '' && !yamlNulls.has(name)) {
      state.name = name;
    }
  } else if (listKeys.has(key)) {
    openList({
      key,
      rest,
      state,
    });
  } else if (key === ConfigKey.Overrides) {
    openOverrides({
      rest,
      state,
    });
  } else {
    // an unknown key is a warning, not a parse error; its lines are skipped
    state.level.kind = Kind.Skip;
  }
};

const readTop = (input: { reader: Reader; text: string }): void => {
  const { reader, text } = input;
  const { state } = reader;

  if (text === MARKER && state.keys.length === 0 && !reader.isMarked) {
    reader.isMarked = true;

    return;
  }

  const { key, rest } = keyedOf({
    pattern: TOP_KEY,
    text,
  });

  if (state.keys.includes(key)) {
    throw new GrammarRefusal();
  }

  closeLevel(state);
  state.keys.push(key);
  openTopValue({
    key,
    rest: trimBlanks(rest),
    state,
  });
};

// A flow list that runs on to the lines below its key, each indented past it.
const readPending = (input: {
  indent: number;
  pending: Pending;
  state: ReaderState;
  text: string;
}): void => {
  const { pending } = input;

  if (input.indent === 0) {
    throw new GrammarRefusal();
  }

  pending.text = `${pending.text} ${input.text}`;

  if (closingBracketOf(pending.text) !== -1) {
    flowList({
      key: pending.key,
      state: input.state,
      text: pending.text,
    });
    input.state.pending = undefined;
  }
};

const readLine = (input: { reader: Reader; written: string }): void => {
  const { reader } = input;
  const line = withoutComment(input.written);

  if (BLANK_LINE.test(line)) {
    return;
  }

  if (TAB_INDENT.test(line)) {
    throw new GrammarRefusal();
  }

  // a line that is not blank holds a character other than a space
  const indent = line.search(NOT_A_SPACE);
  const text = trimBlanks(line);

  if (reader.state.pending !== undefined) {
    readPending({
      indent,
      pending: reader.state.pending,
      state: reader.state,
      text,
    });
  } else if (indent === 0 && !ITEM.test(text)) {
    readTop({
      reader,
      text,
    });
  } else {
    readBody({
      indent,
      state: reader.state,
      text,
    });
  }
};

// A file's last newline leaves an empty line after it, which reads as a blank one.
const linesOf = (text: string): readonly string[] =>
  text.split('\n').map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line));

const readLines = (reader: Reader, lines: readonly string[]): void => {
  for (const written of lines) {
    reader.state.line += 1;
    readLine({
      reader,
      written,
    });
  }

  if (reader.state.pending !== undefined) {
    reader.state.line = reader.state.pending.line;

    throw new GrammarRefusal();
  }
};

const parse = (text: string): ConfigRead => {
  const reader: Reader = {
    isMarked: false,
    state: createReaderState(),
  };
  const { state } = reader;

  try {
    readLines(reader, linesOf(text));
  } catch (error) {
    recognisedFailure({
      error,
      isRecognised: isGrammarRefusal,
    });

    return {
      line: state.line,
      status: ConfigReadStatus.Unparsed,
    };
  }

  closeLevel(state);

  return {
    config: {
      ...(state.check === undefined
        ? {}
        : {
            check: state.check,
          }),
      empties: state.empties,
      items: state.items,
      keys: state.keys,
      lists: state.lists,
      ...(state.name === undefined
        ? {}
        : {
            name: state.name,
          }),
      overrides: state.overrides,
    },
    status: ConfigReadStatus.Parsed,
  };
};

const createConfigFileParser = (): ConfigParser => ({
  parse,
});

export { createConfigFileParser };
