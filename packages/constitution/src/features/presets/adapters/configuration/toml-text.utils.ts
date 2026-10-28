import { stringify } from 'smol-toml';

import { isDeepEqual } from '#/kernel/utils';

import type { ConfigurationWrite } from '../../domain/contracts';
import type { Setting, SettingMap } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import { withBlockComments } from './block-comments.utils';
import { ownFieldOf } from './own-field.utils';
import { LINE_WIDTH, NEWLINE } from './text.constants';
import { tomlCommenting } from './toml-comments.utils';
import { depthOf, headerOf, readToml, STRINGS, unquotedOf } from './toml-lines.utils';

interface Block {
  readonly lines: string[];
  /** empty for the root's lines before any header */
  readonly section: string;
}

// A section is a table by its key, or a table of a table that holds only tables, the two keys
// joined by a character no key holds.
const SEPARATOR = '\u001F';
const BARE_KEY = /^[A-Za-z0-9_-]+$/;
const KEY_LINE = /^\s*("[^"]+"|'[^']+'|[A-Za-z0-9_-]+)\s*=/;
const DOTTED_KEY_LINE = /^\s*[A-Za-z0-9_"'-]+\s*\.\s*[A-Za-z0-9_"'-]/;
const BLANK_RUN = /\n{3,}/g;
// smol-toml writes a value alone only under a key; the key it is given here goes with its prefix.
const VALUE_PREFIX = 'value = ';
const ITEM_INDENT = '  ';
const ARRAY_OPEN = '= [';
const ARRAY_CLOSE = ']';
const NOT_FOUND = -1;
// smol-toml pads an array's brackets with spaces, which the formatter takes out; a string keeps its own.
const paddedBracket = new RegExp(`(${STRINGS.source})|\\[ | \\]`, 'g');
const itemPattern = new RegExp(`(?:${STRINGS.source}|[^,"'])+`, 'g');
// An array that holds a table or an array stays as written.
const NESTED = /[[\]{}]/;

// As the formatter writes it, an array past the width breaks to one item a line.
const styledLine = (line: string): string => {
  const unpadded = line.replace(paddedBracket, (match, text?: string) => text ?? match.trim());
  const open = unpadded.indexOf(ARRAY_OPEN);
  const key = unpadded.slice(0, open + ARRAY_OPEN.length);
  const items = unpadded.slice(key.length, -ARRAY_CLOSE.length);
  const isFlatArray =
    open !== NOT_FOUND &&
    unpadded.endsWith(ARRAY_CLOSE) &&
    // Stryker disable next-line StringLiteral: what stands for a string only has to hold no bracket
    !NESTED.test(items.replace(STRINGS, ''));

  if (unpadded.length <= LINE_WIDTH || !isFlatArray) {
    return unpadded;
  }

  const indent = ' '.repeat(key.length - key.trimStart().length);

  return [
    key,
    // Stryker disable next-line ArrayDeclaration: a line past the width holds items
    (items.match(itemPattern) ?? [])
      .map((listed) => `${indent}${ITEM_INDENT}${listed.trim()}`)
      .join(`,${NEWLINE}`),
    `${indent}${ARRAY_CLOSE}`,
  ].join(NEWLINE);
};

const styled = (text: string): string => text.split(NEWLINE).map(styledLine).join(NEWLINE);

// A table or an array of tables goes under a header of its own, never among the root's keys.
const isTable = (setting: Setting | undefined): boolean =>
  Settings.isMap(setting) ||
  (Settings.isList(setting) && setting.length > 0 && setting.every(Settings.isMap));

const mapOf = (setting: Setting | undefined): SettingMap =>
  Settings.isMap(setting) ? setting : {};

const sectionsOf = (setting: Setting | undefined): ReadonlyMap<string, Setting> =>
  new Map(
    Object.entries(mapOf(setting))
      .filter(([, held]) => isTable(held))
      .flatMap(
        ([key, held]): [
          string,
          Setting,
        ][] =>
          Settings.isMap(held) &&
          Object.keys(held).length > 0 &&
          Object.values(held).every(Settings.isMap)
            ? Object.entries(held).map(
                ([child, table]): [
                  string,
                  Setting,
                ] => [
                  `${key}${SEPARATOR}${child}`,
                  table,
                ],
              )
            : [
                [
                  key,
                  held,
                ],
              ],
      ),
  );

const rootOf = (setting: Setting | undefined): SettingMap =>
  Object.fromEntries(Object.entries(mapOf(setting)).filter(([, held]) => !isTable(held)));

const keyText = (key: string): string => (BARE_KEY.test(key) ? key : JSON.stringify(key));

const inlineOf = (setting: Setting): string => {
  if (Settings.isMap(setting)) {
    return `{ ${Object.entries(setting)
      .map(([key, held]) => `${keyText(key)} = ${inlineOf(held)}`)
      .join(', ')} }`;
  }

  return stringify({
    value: setting,
  })
    .trim()
    .slice(VALUE_PREFIX.length);
};

const spansOf = (
  lines: readonly string[],
  start: number,
):
  | ReadonlyMap<
      string,
      readonly [
        number,
        number,
      ]
    >
  | undefined => {
  const spans = new Map<
    string,
    readonly [
      number,
      number,
    ]
  >();

  // Stryker disable next-line EqualityOperator: the line past the end reads as the text undefined, which is no key
  for (let at = start; at < lines.length; at += 1) {
    const line = String(lines[at]);
    const key = KEY_LINE.exec(line)?.[1];

    if (DOTTED_KEY_LINE.test(line) && key === undefined) {
      return undefined;
    }

    if (key !== undefined) {
      let end = at;

      // Stryker disable next-line EqualityOperator,ArithmeticOperator: a span past the last line takes no more of the block
      for (let depth = depthOf(line); depth > 0 && end + 1 < lines.length; ) {
        end += 1;
        depth += depthOf(String(lines[end]));
      }

      spans.set(unquotedOf(key), [
        at,
        end,
      ]);
      at = end;
    }
  }

  return spans;
};

/**
 * Only the changed keys' lines change, a new key after the last. Undefined where the table is no
 * plain one: a dotted key, or a key the file writes as a table.
 */
const splicedKeys = (input: {
  after: Setting | undefined;
  before: Setting | undefined;
  lines: readonly string[];
  start: number;
}): readonly string[] | undefined => {
  const { start } = input;

  if (!(Settings.isMap(input.before) && Settings.isMap(input.after))) {
    return undefined;
  }

  const { after, before } = input;
  const spans = spansOf(input.lines, start);
  const changed = [
    ...new Set([
      ...Object.keys(before),
      ...Object.keys(after),
    ]),
  ].filter((key) => !isDeepEqual(ownFieldOf(before, key), ownFieldOf(after, key)));

  if (
    spans === undefined ||
    changed.some((key) => ownFieldOf(before, key) !== undefined && !spans.has(key))
  ) {
    return undefined;
  }

  const lineOf = (key: string, held: Setting): string => `${keyText(key)} = ${inlineOf(held)}`;

  const lines = [
    ...input.lines,
  ];
  const added = changed.flatMap((key) => {
    const held = ownFieldOf(after, key);

    // Stryker disable next-line ConditionalExpression: a gone key the spans lack sent the table to be written again above
    return spans.has(key) || held === undefined
      ? []
      : [
          lineOf(key, held),
        ];
  });
  const ends = [
    ...spans.values(),
  ].map(([, last]) => last + 1);
  let place = lines.length;

  while (lines[place - 1]?.trim() === '') {
    place -= 1;
  }

  lines.splice(ends.length === 0 ? place : Math.max(...ends), 0, ...added);

  // the changed keys from the last back, so the places of those before it stay
  for (const [key, [first, last]] of [
    ...spans,
  ]
    .filter(([name]) => changed.includes(name))
    .toSorted(([, left], [, right]) => right[0] - left[0])) {
    const held = ownFieldOf(after, key);

    lines.splice(
      first,
      last - first + 1,
      ...(held === undefined
        ? []
        : [
            lineOf(key, held),
          ]),
    );
  }

  return lines;
};

// smol-toml gives a table of tables no header of its own.
const sectionText = (input: { merged: Setting; section: string }): string => {
  // Stryker disable next-line StringLiteral: a split gives its first part always
  const [table = '', child] = input.section.split(SEPARATOR);
  const held = ownFieldOf(mapOf(input.merged), table);

  // Stryker disable next-line MethodExpression: the blanks around a section collapse to one when the text is joined
  return stringify({
    [table]:
      child === undefined
        ? held
        : {
            [child]: ownFieldOf(mapOf(held), child),
          },
  }).trim();
};

interface Blocks {
  readonly root: readonly string[];
  readonly sections: readonly Block[];
}

const blocksOf = (input: {
  sectionOf: (header: readonly string[]) => string;
  text: string;
}): Blocks => {
  const root: string[] = [];
  const sections: Block[] = [];

  for (const line of input.text.split(NEWLINE)) {
    const header = headerOf(line);
    const current = sections.at(-1)?.lines ?? root;

    if (header === undefined) {
      current.push(line);
    } else {
      sections.push({
        lines: [
          line,
        ],
        section: input.sectionOf(header),
      });
    }
  }

  return {
    root,
    sections,
  };
};

interface Sections {
  readonly after: ReadonlyMap<string, Setting>;
  readonly before: ReadonlyMap<string, Setting>;
}

// A header names a section of a table of tables where either side knows one by both its keys.
const sectionOfHeader =
  (sections: Sections) =>
  (header: readonly string[]): string => {
    // Stryker disable next-line StringLiteral: a header names its first part always
    const [table = '', child] = header;
    const both = `${table}${SEPARATOR}${child}`;

    return child !== undefined && (sections.after.has(both) || sections.before.has(both))
      ? both
      : table;
  };

// A block under a header that names no section, as a table of tables' own header does, holding keys
// it gives that table by dotting them.
const isLoose =
  (sections: Sections) =>
  (block: Block): boolean =>
    !(sections.after.has(block.section) || sections.before.has(block.section)) &&
    block.lines.some((line) => DOTTED_KEY_LINE.test(line));

interface Rewrite {
  readonly before: Setting;
  readonly blocks: readonly Block[];
  readonly merged: Setting;
  readonly sections: Sections;
}

// The lines a changed section's block keeps: its keys spliced where it is a table of one block, else
// the section written again, as an array of tables always is.
const changedLinesOf = (
  input: Rewrite & {
    block: Block;
  },
): readonly string[] => {
  const { block } = input;
  // Stryker disable next-line StringLiteral: a split gives its first part always
  const [table = '', child] = block.section.split(SEPARATOR);
  const isOneBlock = input.blocks.filter((other) => other.section === block.section).length === 1;

  const tableOf = (setting: Setting): Setting | undefined =>
    child === undefined
      ? ownFieldOf(mapOf(setting), table)
      : ownFieldOf(mapOf(ownFieldOf(mapOf(setting), table)), child);

  const spliced = isOneBlock
    ? splicedKeys({
        after: tableOf(input.merged),
        before: tableOf(input.before),
        lines: block.lines,
        start: 1,
      })
    : undefined;

  return (
    spliced ?? [
      sectionText({
        merged: input.merged,
        section: block.section,
      }),
      '',
    ]
  );
};

/**
 * Only the sections whose value changed are written again, and of a plain table only its changed
 * keys, so every other line and comment stays; a section whose table is gone goes with its lines.
 */
const writeSettings = (input: ConfigurationWrite): string => {
  const { settings, text } = input;
  const before = readToml(text) ?? {};
  const sections: Sections = {
    after: sectionsOf(settings),
    before: sectionsOf(before),
  };
  const changed = [
    ...sections.after.keys(),
  ].filter((section) => !isDeepEqual(sections.before.get(section), sections.after.get(section)));
  const blocks = blocksOf({
    sectionOf: sectionOfHeader(sections),
    text,
  });
  const root = isDeepEqual(rootOf(before), rootOf(settings))
    ? blocks.root
    : splicedKeys({
        after: rootOf(settings),
        before: rootOf(before),
        lines: blocks.root,
        start: 0,
      });

  // keys the file dots, at the root or under a header of no section, are no plain keys to splice:
  // the file is written again whole
  if (root === undefined || blocks.sections.some(isLoose(sections))) {
    return `${styled(stringify(settings).trim())}${NEWLINE}`;
  }

  const rewrite: Rewrite = {
    before,
    blocks: blocks.sections,
    merged: settings,
    sections,
  };
  const emitted = new Set<string>();
  const lines = blocks.sections.flatMap((block): readonly string[] => {
    if (!sections.after.has(block.section) && sections.before.has(block.section)) {
      return [];
    }

    if (!changed.includes(block.section)) {
      return block.lines;
    }

    const isFirst = !emitted.has(block.section);

    emitted.add(block.section);

    return isFirst
      ? changedLinesOf({
          ...rewrite,
          block,
        })
      : [];
  });
  const appended = changed
    .filter((section) => !emitted.has(section))
    .flatMap((section) => [
      '',
      sectionText({
        merged: settings,
        section,
      }),
      '',
    ]);

  return `${styled(
    [
      ...root,
      ...lines,
      ...appended,
    ]
      .join(NEWLINE)
      .replace(BLANK_RUN, `${NEWLINE}${NEWLINE}`)
      .trim(),
  )}${NEWLINE}`;
};

const writeToml = withBlockComments({
  commenting: tomlCommenting,
  write: writeSettings,
});

export { writeToml };
