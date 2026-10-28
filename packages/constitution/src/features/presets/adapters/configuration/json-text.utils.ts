import type { JSONPath, Node, ParseError } from 'jsonc-parser';
import { applyEdits, getNodeValue, modify, parse, parseTree, visit } from 'jsonc-parser';

import { compareText, isDeepEqual } from '#/kernel/utils';

import type { ConfigurationWrite } from '../../domain/contracts';
import type { HeldStep, Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { Anchor, Commenting } from './block-comments.utils';
import { anchorAt, noTextLines, withBlockComments } from './block-comments.utils';
import { ownFieldOf } from './own-field.utils';
import { NEWLINE } from './text.constants';
import { settingOfWire } from './wire-setting.utils';

const INDENT = 2;
const FORMATTING = {
  formattingOptions: {
    eol: NEWLINE,
    insertSpaces: true,
    tabSize: INDENT,
  },
} as const;
const INDENT_ONLY = /^\s*$/;

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

const isWireObject = (wire: unknown): wire is Readonly<Record<string, unknown>> =>
  // Stryker disable next-line ConditionalExpression,LogicalOperator: the test only narrows the type
  typeof wire === 'object' && wire !== null && !Array.isArray(wire);

const replaced = (input: { keyPath: JSONPath; text: string; value: Setting | undefined }): string =>
  applyEdits(input.text, modify(input.text, input.keyPath, input.value, FORMATTING));

// A list is edited item by item while the items it keeps stay in their order; any other change, or
// a list holding what the settings cannot, is written whole.
const editedList = (input: {
  after: readonly Setting[];
  before: readonly Setting[];
  keyPath: JSONPath;
  text: string;
}): string => {
  const { after, keyPath } = input;
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
        keyPath: [
          ...keyPath,
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
      keyPath,
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
            ...keyPath,
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
  keyPath: JSONPath;
  text: string;
  wire: unknown;
}): string => {
  const { after, before, keyPath, wire } = input;

  if (isDeepEqual(before, after)) {
    return input.text;
  }

  if (Settings.isMap(before) && Settings.isMap(after) && isWireObject(wire)) {
    const keys = Object.keys(before);
    const gone = keys.filter((key) => !Object.hasOwn(after, key));
    // jsonc-parser leaves a trailing comma behind when it removes an object's last key, so an object
    // that loses every key is emptied whole.
    let text =
      gone.length > 0 && gone.length === keys.length
        ? replaced({
            keyPath,
            text: input.text,
            value: {},
          })
        : gone.reduce(
            (written, key) =>
              replaced({
                keyPath: [
                  ...keyPath,
                  key,
                ],
                text: written,
                value: undefined,
              }),
            input.text,
          );

    for (const [key, held] of Object.entries(after)) {
      text = edited({
        after: held,
        before: ownFieldOf(before, key),
        keyPath: [
          ...keyPath,
          key,
        ],
        text,
        wire: ownFieldOf(wire, key),
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
        keyPath,
        text: input.text,
      })
    : replaced({
        keyPath,
        text: input.text,
        value: after,
      });
};

// The values the settings cannot hold are sorted with the rest.
const sortedIn = (text: string, keyPath: readonly string[]): string => {
  const held = keyPath.reduce<unknown>(
    (wire, key) => (isWireObject(wire) ? ownFieldOf(wire, key) : undefined),
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
            ...keyPath,
          ],
          Object.fromEntries(sorted),
          FORMATTING,
        ),
      );
};

/** A new file is written whole, laid out as the edits lay it. */
const writeJson = (input: ConfigurationWrite): string => {
  const { settings, text } = input;
  const wire = wireOf(text);
  const written = input.sorted.reduce(
    sortedIn,
    edited({
      after: settings,
      before: settingOfWire(wire),
      keyPath: [],
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

interface Child {
  readonly held: Node | undefined;
  /** the node that begins the key or the item */
  readonly start: Node;
  readonly step: HeldStep;
}

const childrenOf = (node: Node | undefined): readonly Child[] => {
  // Stryker disable next-line OptionalChaining: no node is missing, the written root nor a value
  const isObject = node?.type === 'object';

  // Stryker disable next-line OptionalChaining,ArrayDeclaration: no node is missing, and a scalar's children are none either way
  return (node?.children ?? []).flatMap((child): readonly Child[] => {
    const setting = settingOfWire(getNodeValue(child));

    if (isObject) {
      return [
        {
          // Stryker disable next-line OptionalChaining: a parsed property always holds its key and its value
          held: child.children?.[1],
          start: child,
          step: {
            // Stryker disable next-line OptionalChaining: a parsed property always holds its key
            key: String(child.children?.[0]?.value),
          },
        },
      ];
    }

    return setting === undefined
      ? []
      : [
          {
            held: child,
            start: child,
            step: {
              item: setting,
            },
          },
        ];
  });
};

const jsoncAnchorsOf = (text: string): readonly Anchor[] => {
  const walk = (node: Node | undefined, keyPath: readonly HeldStep[]): readonly Anchor[] =>
    childrenOf(node).flatMap((child) => {
      const at = [
        ...keyPath,
        child.step,
      ];

      return [
        ...anchorAt({
          lineStart: INDENT_ONLY,
          offset: child.start.offset,
          keyPath: at,
          text,
        }),
        ...walk(child.held, at),
      ];
    });

  return walk(parseTree(text), []);
};

const jsoncCommenting: Commenting = {
  anchorsOf: jsoncAnchorsOf,
  prefix: '//',
  textLinesOf: noTextLines,
};

/** As the formatter writes JSONC: a comma after the last item of a list broken over lines. */
const writeCommas = (input: ConfigurationWrite): string => {
  const written = writeJson(input);

  return missingCommasOf(written)
    .toSorted((left, right) => right - left)
    .reduce((text, at) => `${text.slice(0, at)},${text.slice(at)}`, written);
};

const writeJsonc = withBlockComments({
  commenting: jsoncCommenting,
  write: writeCommas,
});

/** JSON with comments under a `.json` name, its commas as a formatter writes plain JSON. */
const writeCommentedJson = withBlockComments({
  commenting: jsoncCommenting,
  write: writeJson,
});

export { readJson, writeCommentedJson, writeJson, writeJsonc };
