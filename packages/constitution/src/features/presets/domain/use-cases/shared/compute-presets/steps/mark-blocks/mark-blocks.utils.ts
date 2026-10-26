import type {
  BlockMark,
  Contribution,
  MarkStep,
  PresetEntry,
  PresetValue,
} from '../../../../../entities';
import {
  BlockMarks,
  PresetEntry as Entries,
  Setting,
  ValueKind,
  PresetValue as Values,
} from '../../../../../entities';
import { KeyKind, SettingKey } from '../../../../../value-objects';

interface MarkBlocksInput {
  readonly contributions: readonly Contribution[];
  /** every entry the presets hold, whatever the unit's blocks */
  readonly entries: readonly PresetEntry[];
  readonly merged: Setting | undefined;
  readonly written: readonly PresetEntry[];
}

/**
 * Where a value stands: its path as the file holds it, and as the merge holds it, which keeps an
 * addressed element under its address as a key.
 */
interface Place {
  readonly merged: readonly MarkStep[];
  readonly path: readonly MarkStep[];
}

/** What an entry gives at a place: the value there, or, where it has none, whatever is held there. */
interface Given extends Place {
  readonly value?: Setting;
}

interface Node {
  readonly blocks: Set<string>;
  readonly path: readonly MarkStep[];
}

const keyOf = (path: readonly MarkStep[]): string => Setting.canonicalTextOf(path);

const childOf = (holder: Setting | undefined, step: MarkStep): Setting | undefined => {
  if (typeof step === 'string') {
    return Setting.isMap(holder) ? holder[step] : undefined;
  }

  return Setting.isList(holder)
    ? holder.find((listed) =>
        BlockMarks.isStepOf(step, {
          item: listed,
        }),
      )
    : undefined;
};

const isHeld = (merged: Setting, given: Given): boolean => {
  const held = given.merged.reduce<Setting | undefined>(childOf, merged);

  return given.value === undefined ? held !== undefined : Setting.same(held, given.value);
};

const placeOf = (place: Place, step: MarkStep, merged: MarkStep = step): Place => ({
  merged: [
    ...place.merged,
    merged,
  ],
  path: [
    ...place.path,
    step,
  ],
});

const itemsAt = (place: Place, items: readonly Setting[]): readonly Given[] =>
  items.map((listed) =>
    placeOf(place, {
      item: listed,
    }),
  );

// A default is the file's own once written, so it gives no mark.
const givenOf = (preset: PresetValue, place: Place): readonly Given[] => {
  if (preset.kind === ValueKind.Default) {
    return [];
  }

  if (preset.kind !== ValueKind.Map) {
    const { setting } = preset;

    if (preset.isWords === true) {
      return [
        place,
      ];
    }

    if (!Setting.isList(setting)) {
      return [
        {
          ...place,
          value: setting,
        },
      ];
    }

    const items = setting.filter((listed) => Values.slotOf(listed) === undefined);

    return items.length === 0
      ? [
          place,
        ]
      : itemsAt(place, items);
  }

  if (preset.pairs.length === 0) {
    return [
      place,
    ];
  }

  return preset.pairs.flatMap((pair) => {
    const key = SettingKey.of(pair.key);

    if (key.kind === KeyKind.Insert) {
      return itemsAt(placeOf(place, key.list), Values.itemsOf(pair.value));
    }

    if (key.kind === KeyKind.Plain) {
      return givenOf(pair.value, placeOf(place, key.name));
    }

    const element = placeOf(
      {
        merged: place.merged,
        path: [
          ...place.path,
          key.list,
        ],
      },
      {
        field: key.field,
        value: key.value,
      },
      pair.key,
    );

    return [
      element,
      ...givenOf(pair.value, element),
    ];
  });
};

// Each value the file holds belongs to the first entry that gives it, in the merge's order.
const nodesOf = (input: {
  contributions: readonly Contribution[];
  merged: Setting;
}): Map<string, Node> => {
  const nodes = new Map<string, Node>();
  const claimed = new Set<string>();

  for (const contribution of input.contributions) {
    for (const given of givenOf(contribution.value, {
      merged: [],
      path: [],
    })) {
      const key = keyOf(given.path);

      if (isHeld(input.merged, given) && !claimed.has(key)) {
        claimed.add(key);

        for (let length = 1; length <= given.path.length; length += 1) {
          const path = given.path.slice(0, length);
          const node = nodes.get(keyOf(path)) ?? {
            blocks: new Set<string>(),
            path,
          };

          nodes.set(keyOf(path), {
            ...node,
            blocks: node.blocks.add(contribution.block),
          });
        }
      }
    }
  }

  return nodes;
};

/**
 * The keys and items one block alone gives, each below a key or an item several blocks fill or at
 * the file's top; and every block an entry of the file's path names. Undefined where the entries
 * write only defaults.
 */
const markBlocks = (input: MarkBlocksInput): BlockMarks | undefined => {
  const { merged } = input;

  if (merged === undefined) {
    return undefined;
  }

  const nodes = nodesOf({
    contributions: input.contributions,
    merged,
  });

  const shared = new Set(
    [
      ...nodes,
    ]
      .filter(([, node]) => node.blocks.size > 1)
      .map(([key]) => key),
  );

  const isShared = (path: readonly MarkStep[]): boolean =>
    path.length === 0 || shared.has(keyOf(path));

  const paths = new Set(input.written.map((entry) => entry.file.path));

  return {
    blocks: [
      ...new Set(input.entries.filter((entry) => paths.has(entry.file.path)).map(Entries.blockOf)),
    ],
    marks: [
      ...nodes.values(),
    ].flatMap((node): readonly BlockMark[] => {
      const blocks = [
        ...node.blocks,
      ];

      return blocks.length === 1 && isShared(node.path.slice(0, -1))
        ? blocks.map((block) => ({
            block,
            path: node.path,
          }))
        : [];
    }),
  };
};

export type { MarkBlocksInput };
export { markBlocks };
