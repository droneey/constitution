import type { HeldStep, Setting } from '../../domain/entities';
import { Setting as Settings } from '../../domain/entities';
import type { Anchor, Commenting } from './block-comments.utils';
import { ownFieldOf } from './own-field.utils';
import { NEWLINE } from './text.constants';
import { depthOf, headerOf, keysOfText, readToml } from './toml-lines.utils';

const KEY_PATH = /^\s*([^\s#=[][^=]*?)\s*=/;
const MULTILINE_QUOTE = /"{3}|'{3}/g;
const ITEM_KEY = 'items';

const multilineStringLinesOf = (lines: readonly string[]): ReadonlySet<number> => {
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

const lineArrayItemOf = (line: string): Setting | undefined => {
  const parsed = readToml(`${ITEM_KEY} = [${line}\n]`);
  const items = Settings.isMap(parsed) ? parsed[ITEM_KEY] : undefined;

  return Settings.isList(items) && items.length === 1 ? items[0] : undefined;
};

const arrayTableElementOf = (input: {
  counts: Map<string, number>;
  keys: readonly string[];
  settings: Setting | undefined;
}): Setting | undefined => {
  const name = JSON.stringify(input.keys);
  const at = input.counts.get(name) ?? 0;
  const list = input.keys.reduce<Setting | undefined>(
    (held, key) => (Settings.isMap(held) ? ownFieldOf(held, key) : undefined),
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
  const element = arrayTableElementOf({
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
    lineArrayItemOf(input.line),
  ]
    .filter((listed) => listed !== undefined)
    .map((listed) => ({
      line: input.at,
      keyPath: [
        ...input.array,
        {
          item: listed,
        },
      ],
    }));

const tomlAnchorsOf = (text: string): readonly Anchor[] => {
  const lines = text.split(NEWLINE);
  const strings = multilineStringLinesOf(lines);
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
        keyPath: table,
      });
    } else if (keys !== undefined) {
      array = [
        ...table,
        ...keyStepsOf(keysOfText(keys)),
      ];
      depth = depthOf(line);
      anchors.push({
        line: at,
        keyPath: array,
      });
    }
  }

  return anchors;
};

const tomlCommenting: Commenting = {
  anchorsOf: tomlAnchorsOf,
  prefix: '#',
  linesInsideTextValuesOf: (text) => multilineStringLinesOf(text.split(NEWLINE)),
};

export { tomlCommenting };
