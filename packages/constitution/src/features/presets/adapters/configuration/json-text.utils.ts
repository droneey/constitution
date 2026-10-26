import type { JSONPath, ParseError } from 'jsonc-parser';
import { applyEdits, modify, parse, visit } from 'jsonc-parser';

import { compareText, isDeepEqual } from '#/kernel/utils';

import type { Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { SettingsText } from './settings-text.types';
import { settingOfWire } from './wire-setting.utils';

const INDENT = 2;
const FORMATTING = {
  formattingOptions: {
    eol: '\n',
    insertSpaces: true,
    tabSize: INDENT,
  },
} as const;
const NEWLINE = '\n';

const wireOf = (text: string): unknown => {
  const errors: ParseError[] = [];
  const wire: unknown = parse(text, errors, {
    allowTrailingComma: true,
  });

  return errors.length === 0 ? wire : undefined;
};

/** An empty text holds no settings; one that does not parse gives undefined. */
const readJson = (text: string): Setting | undefined =>
  text.trim() === '' ? {} : settingOfWire(wireOf(text));

// Stryker disable ConditionalExpression,LogicalOperator: the test only narrows the type
const isWireObject = (wire: unknown): wire is Readonly<Record<string, unknown>> =>
  typeof wire === 'object' && wire !== null && !Array.isArray(wire);
// Stryker restore ConditionalExpression,LogicalOperator

const replaced = (input: { path: JSONPath; text: string; value: Setting | undefined }): string =>
  applyEdits(input.text, modify(input.text, input.path, input.value, FORMATTING));

// A list is edited item by item while the items it keeps stay in their order; any other change, or
// a list holding what the settings cannot, is written whole.
const editedList = (input: {
  after: readonly Setting[];
  before: readonly Setting[];
  path: JSONPath;
  text: string;
}): string => {
  const { after, path } = input;
  const wanted = after.map(Settings.canonicalTextOf);
  const current = input.before.map(Settings.canonicalTextOf);
  const gone = current.flatMap((listed, at) =>
    wanted.includes(listed)
      ? []
      : [
          at,
        ],
  );
  const kept = current.filter((listed) => wanted.includes(listed));
  let text = gone.toReversed().reduce(
    (written, at) =>
      replaced({
        path: [
          ...path,
          at,
        ],
        text: written,
        value: undefined,
      }),
    input.text,
  );

  if (
    !isDeepEqual(
      wanted.filter((listed) => kept.includes(listed)),
      kept,
    )
  ) {
    return replaced({
      path,
      text: input.text,
      value: after,
    });
  }

  for (const [at, listed] of wanted.entries()) {
    if (kept[at] !== listed) {
      text = applyEdits(
        text,
        modify(
          text,
          [
            ...path,
            at,
          ],
          after[at],
          {
            ...FORMATTING,
            isArrayInsertion: true,
          },
        ),
      );
      kept.splice(at, 0, listed);
    }
  }

  return text;
};

// The changes are edits of the text, so its comments and layout stay where nothing changed; a key
// whose value the settings cannot hold, such as a null, is never touched.
const edited = (input: {
  after: Setting;
  before: Setting | undefined;
  path: JSONPath;
  text: string;
  wire: unknown;
}): string => {
  const { after, before, path, wire } = input;

  if (isDeepEqual(before, after)) {
    return input.text;
  }

  if (Settings.isMap(before) && Settings.isMap(after) && isWireObject(wire)) {
    let text = input.text;

    for (const key of Object.keys(before).filter((held) => !(held in after))) {
      text = replaced({
        path: [
          ...path,
          key,
        ],
        text,
        value: undefined,
      });
    }

    for (const [key, held] of Object.entries(after)) {
      text = edited({
        after: held,
        before: before[key],
        path: [
          ...path,
          key,
        ],
        text,
        wire: wire[key],
      });
    }

    return text;
  }

  return Settings.isList(before) &&
    Settings.isList(after) &&
    Array.isArray(wire) &&
    wire.length === before.length
    ? editedList({
        after,
        before,
        path,
        text: input.text,
      })
    : replaced({
        path,
        text: input.text,
        value: after,
      });
};

// The values the settings cannot hold are sorted with the rest.
const sortedIn = (text: string, path: readonly string[]): string => {
  const held = path.reduce<unknown>(
    (wire, key) => (isWireObject(wire) ? wire[key] : undefined),
    wireOf(text),
  );

  if (!isWireObject(held)) {
    return text;
  }

  const entries = Object.entries(held);
  const sorted = entries.toSorted(([left], [right]) => compareText(left, right));

  return isDeepEqual(entries, sorted)
    ? text
    : applyEdits(
        text,
        modify(
          text,
          [
            ...path,
          ],
          Object.fromEntries(sorted),
          FORMATTING,
        ),
      );
};

/** A new file is written whole, laid out as the edits lay it. */
const writeJson = (input: SettingsText): string => {
  const { settings, text } = input;
  const wire = wireOf(text);
  const written = input.sorted.reduce(
    sortedIn,
    edited({
      after: settings,
      before: settingOfWire(wire),
      path: [],
      text,
      wire,
    }),
  );

  return written.endsWith(NEWLINE) ? written : `${written}${NEWLINE}`;
};

interface Container {
  /** where the value read last ends, while no separator follows it */
  lastEnd?: number | undefined;
}

const missingCommasOf = (text: string): readonly number[] => {
  const containers: Container[] = [];
  const missing: number[] = [];

  const valueEnds = (end: number): void => {
    const container = containers.at(-1);

    if (container !== undefined) {
      container.lastEnd = end;
    }
  };

  const opened = (): void => {
    containers.push({});
  };

  const closed = (offset: number, length: number): void => {
    // Stryker disable next-line OptionalChaining: a close always follows its open
    const lastEnd = containers.pop()?.lastEnd;

    if (lastEnd !== undefined && text.slice(lastEnd, offset).includes(NEWLINE)) {
      missing.push(lastEnd);
    }

    valueEnds(offset + length);
  };

  visit(text, {
    onArrayBegin: opened,
    onArrayEnd: closed,
    onLiteralValue: (_value: unknown, offset: number, length: number) => {
      valueEnds(offset + length);
    },
    onObjectBegin: opened,
    onObjectEnd: closed,
    // a comma ends the value before it, and a colon follows a key, which no value precedes
    onSeparator: () => {
      const container = containers.at(-1);

      // Stryker disable next-line ConditionalExpression: a separator stands only inside a list or an object
      if (container !== undefined) {
        container.lastEnd = undefined;
      }
    },
  });

  return missing;
};

/** As the formatter writes JSONC: a comma after the last item of a list broken over lines. */
const writeJsonc = (input: SettingsText): string => {
  const written = writeJson(input);

  return missingCommasOf(written)
    .toSorted((left, right) => right - left)
    .reduce((text, at) => `${text.slice(0, at)},${text.slice(at)}`, written);
};

export { readJson, writeJson, writeJsonc };
