import type { JSONPath, ParseError } from 'jsonc-parser';
import { applyEdits, modify, parse } from 'jsonc-parser';

import { isDeepEqual } from '#/kernel/utils';

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

/** A new file is written whole, laid out as the edits lay it. */
const writeJson = (input: SettingsText): string => {
  const { settings, text } = input;
  const wire = wireOf(text);
  const written = edited({
    after: settings,
    before: settingOfWire(wire),
    path: [],
    text,
    wire,
  });

  return written.endsWith(NEWLINE) ? written : `${written}${NEWLINE}`;
};

export { readJson, writeJson };
