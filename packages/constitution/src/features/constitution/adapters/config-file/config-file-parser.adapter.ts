import { recognisedFailure } from '#/kernel/utils';

import type { ConfigParser } from '../../domain/contracts';
import type { ConfigRead } from '../../domain/entities';
import { ConfigReadStatus } from '../../domain/entities';
import type { Pending, ReaderState } from './config-reader.utils';
import {
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
} from './config-reader.utils';
import {
  closingBracketOf,
  isRefusal,
  refusal,
  scalarOf,
  trimBlanks,
  withoutComment,
} from './scalars.utils';

// constitution.yaml in the fixed subset of YAML its grammar allows, read line by line as a person
// reads it: a line outside the subset stops the read there, and the hook gives core alone.

const LISTS: ReadonlySet<string> = new Set([
  'axes',
  'domains',
  'platforms',
  'languages',
  'implementations',
  'packs',
]);
const CHECK = 'check';
const PACKAGES = 'packages';
const OVERRIDES = 'overrides';
const MARKER = '---';
const TOP_KEY = /^[A-Za-z_][A-Za-z0-9_-]*:/;
const EMPTY_FLOW_MAP = /^\{ *\}$/;
const EMPTY_APP = /:[ \t]*\{[ \t]*\}$/;
const EMPTY_APP_VALUE = /[ \t]*\{[ \t]*\}$/;
const BLANK_LINE = /^[ \t]*$/;
const TAB_INDENT = /^ *\t/;
const NOT_A_SPACE = /[^ ]/;
const APP_INDENT = 2;
const APP_KEY_INDENT = 4;

interface Reader {
  readonly appKeys: Set<string>;
  readonly emptyApps: Set<string>;
  isMarked: boolean;
  readonly state: ReaderState;
}

// The keys after packages are the repository's.
const closePackages = (state: ReaderState): void => {
  if (state.apps.length === 0) {
    state.empties.push({
      app: '',
      key: PACKAGES,
    });
  }

  state.app = '';
};

// Closes the key above before the next key or the end of the file.
const closeTop = (state: ReaderState): void => {
  closeLevel({
    depth: 1,
    state,
  });

  if (state.levels[0].kind === Kind.Packages) {
    closePackages(state);
  }

  closeLevel({
    depth: 0,
    state,
  });
};

const openTopValue = (input: { key: string; rest: string; state: ReaderState }): void => {
  const { key, rest, state } = input;
  const top = state.levels[0];

  if (key === CHECK) {
    const check = scalarOf(rest);

    top.kind = Kind.Scalar;

    if (check === '') {
      state.empties.push({
        app: '',
        key: CHECK,
      });
    } else {
      state.check = check;
    }
  } else if (LISTS.has(key)) {
    openList({
      depth: 0,
      place: {
        app: '',
        key,
      },
      rest,
      state,
    });
  } else if (key === PACKAGES) {
    if (rest !== '' && !EMPTY_FLOW_MAP.test(rest)) {
      throw refusal();
    }

    top.kind = rest === '' ? Kind.Packages : Kind.Done;
  } else if (key === OVERRIDES) {
    openOverrides({
      depth: 0,
      rest,
      state,
    });
  } else {
    // an unknown key is a warning, not a parse error; its lines are skipped
    top.kind = Kind.Skip;
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
    throw refusal();
  }

  closeTop(state);
  state.keys.push(key);
  openTopValue({
    key,
    rest: trimBlanks(rest),
    state,
  });
};

const openApp = (input: { reader: Reader; text: string }): void => {
  const { reader } = input;
  const { state } = reader;
  const isEmpty = EMPTY_APP.test(input.text);
  const head = isEmpty ? input.text.replace(EMPTY_APP_VALUE, '') : input.text;

  if (!head.endsWith(':')) {
    throw refusal();
  }

  closeLevel({
    depth: 1,
    state,
  });

  const app = scalarOf(head.slice(0, -1));

  if (app === '' || state.apps.includes(app)) {
    throw refusal();
  }

  state.app = app;
  state.apps.push(app);

  if (isEmpty) {
    reader.emptyApps.add(app);
  }
};

const openAppKey = (input: { reader: Reader; text: string }): void => {
  const { reader } = input;
  const { state } = reader;
  const { key, rest } = keyedOf({
    pattern: LOWER_KEY,
    text: input.text,
  });
  const placed = `${state.app}\n${key}`;

  if (reader.appKeys.has(placed)) {
    throw refusal();
  }

  reader.appKeys.add(placed);
  closeLevel({
    depth: 1,
    state,
  });

  if (LISTS.has(key)) {
    openList({
      depth: 1,
      place: {
        app: state.app,
        key,
      },
      rest: trimBlanks(rest),
      state,
    });
  } else if (key === OVERRIDES) {
    openOverrides({
      depth: 1,
      rest: trimBlanks(rest),
      state,
    });
  } else {
    throw refusal();
  }
};

const readAppLine = (input: { indent: number; reader: Reader; text: string }): void => {
  const { reader } = input;
  const isItem = ITEM.test(input.text);

  if (input.indent === APP_INDENT && !isItem) {
    openApp(input);
  } else if (
    reader.state.app === '' ||
    input.indent < APP_KEY_INDENT ||
    reader.emptyApps.has(reader.state.app)
  ) {
    throw refusal();
  } else if (input.indent === APP_KEY_INDENT && !isItem) {
    openAppKey(input);
  } else {
    readBody({
      depth: 1,
      indent: input.indent,
      state: reader.state,
      text: input.text,
    });
  }
};

// A flow list that runs on to the lines below its key, each indented past it.
const readPending = (input: {
  indent: number;
  pending: Pending;
  state: ReaderState;
  text: string;
}): void => {
  const { pending } = input;

  if (input.indent <= pending.indent) {
    throw refusal();
  }

  pending.text = `${pending.text} ${input.text}`;

  if (closingBracketOf(pending.text) !== -1) {
    flowList({
      place: {
        app: pending.app,
        key: pending.key,
      },
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
    throw refusal();
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
  } else if (reader.state.levels[0].kind === Kind.Packages) {
    readAppLine({
      indent,
      reader,
      text,
    });
  } else {
    readBody({
      depth: 0,
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

    throw refusal();
  }
};

const parse = (text: string): ConfigRead => {
  const reader: Reader = {
    appKeys: new Set(),
    emptyApps: new Set(),
    isMarked: false,
    state: createReaderState(),
  };
  const { state } = reader;

  try {
    readLines(reader, linesOf(text));
  } catch (error) {
    recognisedFailure({
      error,
      isRecognised: isRefusal,
    });

    return {
      line: state.line,
      status: ConfigReadStatus.Unparsed,
    };
  }

  closeTop(state);

  return {
    config: {
      apps: state.apps,
      ...(state.check === undefined
        ? {}
        : {
            check: state.check,
          }),
      empties: state.empties,
      items: state.items,
      keys: state.keys,
      lists: state.lists,
      overrides: state.overrides,
    },
    status: ConfigReadStatus.Parsed,
  };
};

const createConfigFileParser = (): ConfigParser => ({
  parse,
});

export { createConfigFileParser };
