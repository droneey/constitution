import type { HeldStep, Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { Anchor, Commenting } from './block-comments.utils';
import { depthOf, headerOf, keysOfText, readToml } from './toml-lines.utils';

const NEWLINE = '\n';
// A key's line: its keys, dotted or quoted, before the first equals sign.
const KEY_PATH = /^\s*([^\s#=[][^=]*?)\s*=/;
const MULTILINE_QUOTE = /"{3}|'{3}/g;
const ITEM_KEY = 'items';

// The lines a multi-line string holds past its opening one, which hold no key and no comment.
const stringLinesOf = (lines: readonly string[]): ReadonlySet<number> => {
  const inside = new Set<number>();
  let open: string | undefined;

  for (const [at, line] of lines.entries()) {
    if (open !== undefined) {
      inside.add(at);
    }

    for (const quote of line.match(MULTILINE_QUOTE) ?? []) {
      if (open === undefined) {
        open = quote;
      } else if (open === quote) {
        open = undefined;
      }
    }
  }

  return inside;
};

// An item of an array broken over lines, where the line holds it alone, read as a one-item array.
const itemOf = (line: string): Setting | undefined => {
  const parsed = readToml(`${ITEM_KEY} = [${line}\n]`);
  const items = Settings.isMap(parsed) ? parsed[ITEM_KEY] : undefined;

  return Settings.isList(items) && items.length === 1 ? items[0] : undefined;
};

// The element an array-of-tables header opens: the one after those its earlier headers opened.
const elementOf = (input: {
  counts: Map<string, number>;
  keys: readonly string[];
  settings: Setting | undefined;
}): Setting | undefined => {
  const name = JSON.stringify(input.keys);
  const at = input.counts.get(name) ?? 0;
  const list = input.keys.reduce<Setting | undefined>(
    (held, key) => (Settings.isMap(held) ? held[key] : undefined),
    input.settings,
  );

  input.counts.set(name, at + 1);

  return Settings.isList(list) ? list[at] : undefined;
};

const keyStepsOf = (keys: readonly string[]): readonly HeldStep[] =>
  keys.map((key) => ({
    key,
  }));

const tablePathOf = (input: {
  counts: Map<string, number>;
  header: readonly string[];
  settings: Setting | undefined;
}): readonly HeldStep[] => {
  const element = elementOf({
    counts: input.counts,
    keys: input.header,
    settings: input.settings,
  });

  return [
    ...keyStepsOf(input.header),
    ...(element === undefined
      ? []
      : [
          {
            item: element,
          },
        ]),
  ];
};

const itemAnchorsOf = (input: {
  array: readonly HeldStep[];
  at: number;
  line: string;
}): readonly Anchor[] =>
  [
    itemOf(input.line),
  ]
    .filter((listed) => listed !== undefined)
    .map((listed) => ({
      line: input.at,
      path: [
        ...input.array,
        {
          item: listed,
        },
      ],
    }));

const tomlAnchorsOf = (text: string): readonly Anchor[] => {
  const lines = text.split(NEWLINE);
  const strings = stringLinesOf(lines);
  const settings = readToml(text);
  const counts = new Map<string, number>();
  const anchors: Anchor[] = [];
  let table: readonly HeldStep[] = [];
  let array = table;
  let depth = 0;

  for (const [at, line] of lines.entries()) {
    const header = headerOf(line);
    const keys = KEY_PATH.exec(line)?.[1];

    if (strings.has(at)) {
      continue;
    }

    if (depth > 0) {
      depth += depthOf(line);
      anchors.push(
        ...itemAnchorsOf({
          array,
          at,
          line,
        }),
      );
    } else if (header !== undefined) {
      table = tablePathOf({
        counts,
        header,
        settings,
      });
      anchors.push({
        line: at,
        path: table,
      });
    } else if (keys !== undefined) {
      array = [
        ...table,
        ...keyStepsOf(keysOfText(keys)),
      ];
      depth = depthOf(line);
      anchors.push({
        line: at,
        path: array,
      });
    }
  }

  return anchors;
};

const tomlCommenting: Commenting = {
  anchorsOf: tomlAnchorsOf,
  prefix: '#',
  textLinesOf: (text) => stringLinesOf(text.split(NEWLINE)),
};

export { tomlCommenting };
