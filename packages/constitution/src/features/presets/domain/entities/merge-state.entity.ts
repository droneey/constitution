import type { PresetPair, PresetValue } from './preset-value.entity';
import { PresetValue as Value } from './preset-value.entity';
import type { MergeProblem } from './presets-finding.entity';
import { PresetsCode } from './presets-finding.entity';
import { Setting } from './setting.entity';

interface Insert {
  readonly items: readonly (readonly Setting[])[];
  readonly list: readonly string[];
  readonly slot: string;
}

interface Replacer {
  readonly keyPath: readonly string[];
  readonly setting: Setting;
  readonly source: string;
}

/**
 * What the contributions merged so far hold. Each step gives a new one, copying the collection it
 * changes: a merge of a file's few hundred paths costs milliseconds more than one that mutates,
 * and no step sees another's state change under it.
 */
interface MergeState {
  readonly clashes: ReadonlyMap<string, MergeProblem>;
  readonly defaults: readonly {
    readonly keyPath: readonly string[];
    readonly value: Setting;
  }[];
  /** the paths an entry writes as an empty map, which stay though nothing fills them */
  readonly empties: ReadonlySet<string>;
  readonly inserts: ReadonlyMap<string, Insert>;
  readonly owners: ReadonlyMap<string, string>;
  readonly problems: readonly MergeProblem[];
  readonly replacers: ReadonlyMap<string, Replacer>;
  /** the paths of the maps an entry marks sorted */
  readonly sorted: ReadonlyMap<string, readonly string[]>;
  /** what the entries write */
  readonly value?: Setting;
  /** the file as a default, as its defaults unite */
  readonly whole?: Setting;
}

/** Where a contribution places what it gives, and whose it is. */
interface Placed {
  readonly keyPath: readonly string[];
  readonly source: string;
}

interface PlacedSetting extends Placed {
  readonly setting: Setting;
}

interface PlacedMap extends Placed {
  readonly isSorted: boolean;
  readonly pairs: readonly PresetPair[];
}

const unmerged: MergeState = {
  clashes: new Map(),
  defaults: [],
  empties: new Set(),
  inserts: new Map(),
  owners: new Map(),
  problems: [],
  replacers: new Map(),
  sorted: new Map(),
};

// The owner of the file as a default, kept apart from the owner of its value's root.
// Stryker disable next-line StringLiteral: any text that no key path's JSON spells keeps it apart
const WHOLE_OWNER = 'whole';

const keyOf = (keyPath: readonly string[]): string => JSON.stringify(keyPath);

// A key held already keeps its place, so the steps after the fold meet the paths in their order.
const withEntry = <TKey, TValue>(
  map: ReadonlyMap<TKey, TValue>,
  key: TKey,
  held: TValue,
): ReadonlyMap<TKey, TValue> =>
  new Map([
    ...map,
    [
      key,
      held,
    ],
  ]);

// A key here is the preset file's own, an address among them: the merge never reads one through a list.
const heldAt = (setting: Setting | undefined, keyPath: readonly string[]): Setting | undefined =>
  keyPath.reduce<Setting | undefined>(
    (held, key) => (Setting.isMap(held) ? held[key] : undefined),
    setting,
  );

const withHeldAt = (input: {
  held: Setting;
  keyPath: readonly string[];
  setting: Setting | undefined;
}): Setting => {
  const [key, ...rest] = input.keyPath;

  if (key === undefined) {
    return input.held;
  }

  const map = Setting.isMap(input.setting) ? input.setting : {};

  return {
    ...map,
    [key]: withHeldAt({
      held: input.held,
      keyPath: rest,
      setting: map[key],
    }),
  };
};

const placedAt = (
  state: MergeState,
  input: {
    held: Setting;
    keyPath: readonly string[];
  },
): MergeState => ({
  ...state,
  value: withHeldAt({
    ...input,
    setting: state.value,
  }),
});

const clashed = (
  state: MergeState,
  placed: Placed,
  key: string = keyOf(placed.keyPath),
): MergeState => ({
  ...state,
  clashes: withEntry(state.clashes, key, {
    code: PresetsCode.Clash,
    details: {
      setting: Setting.pathTextOf(placed.keyPath),
      sources: [
        state.owners.get(key) ?? placed.source,
        placed.source,
      ],
    },
  }),
});

// Called only where the path is first written, so the owner is the first source that wrote it.
const owned = (
  state: MergeState,
  placed: Placed,
  key: string = keyOf(placed.keyPath),
): MergeState => ({
  ...state,
  owners: withEntry(state.owners, key, placed.source),
});

const withProblem = (state: MergeState, problem: MergeProblem): MergeState => ({
  ...state,
  problems: [
    ...state.problems,
    problem,
  ],
});

const replaced = (state: MergeState, placed: PlacedSetting): MergeState => {
  const key = keyOf(placed.keyPath);
  const before = state.replacers.get(key);

  if (before === undefined) {
    return {
      ...state,
      replacers: withEntry(state.replacers, key, {
        keyPath: placed.keyPath,
        setting: placed.setting,
        source: placed.source,
      }),
    };
  }

  return Setting.same(before.setting, placed.setting)
    ? state
    : withProblem(state, {
        code: PresetsCode.TwoReplacers,
        details: {
          setting: Setting.pathTextOf(placed.keyPath),
          sources: [
            before.source,
            placed.source,
          ],
        },
      });
};

// The items of an entry join the list once each, but an item the entry itself repeats stays repeated.
const joined = (current: readonly Setting[], items: readonly Setting[]): readonly Setting[] => [
  ...current,
  ...items.filter((listed) => !current.some((known) => Setting.same(known, listed))),
];

// Several whole-file defaults unite as their values do: lines and keys join, two texts clash.
const unitedWhole = (state: MergeState, placed: PlacedSetting): MergeState => {
  const { whole } = state;
  const { setting } = placed;

  if (whole === undefined) {
    return {
      ...owned(state, placed, WHOLE_OWNER),
      whole: setting,
    };
  }

  if (Setting.isList(whole) && Setting.isList(setting)) {
    return {
      ...state,
      whole: joined(whole, setting),
    };
  }

  if (Setting.isMap(whole) && Setting.isMap(setting)) {
    return {
      ...state,
      whole: {
        ...whole,
        ...setting,
      },
    };
  }

  return Setting.same(whole, setting) ? state : clashed(state, placed, WHOLE_OWNER);
};

const defaulted = (state: MergeState, placed: PlacedSetting): MergeState => {
  const { keyPath, setting } = placed;

  if (keyPath.length === 0) {
    return unitedWhole(state, placed);
  }

  const isKnown = state.defaults.some(
    (known) => Setting.same(known.keyPath, keyPath) && Setting.same(known.value, setting),
  );

  return isKnown
    ? state
    : {
        ...state,
        defaults: [
          ...state.defaults,
          {
            keyPath,
            value: setting,
          },
        ],
      };
};

// An insert is kept whole: the same insert from two entries goes in once.
const inserted = (
  state: MergeState,
  input: {
    list: readonly string[];
    slot: string;
    value: PresetValue;
  },
): MergeState => {
  const key = keyOf([
    ...input.list,
    input.slot,
  ]);
  const record = state.inserts.get(key) ?? {
    items: [],
    list: input.list,
    slot: input.slot,
  };
  const items = Value.itemsOf(input.value);
  const isKnown = record.items.some((known) => Setting.same(known, items));

  return {
    ...state,
    inserts: withEntry(
      state.inserts,
      key,
      isKnown
        ? record
        : {
            ...record,
            items: [
              ...record.items,
              items,
            ],
          },
    ),
  };
};

const settingPlaced = (state: MergeState, placed: PlacedSetting): MergeState => {
  const { setting } = placed;
  const current = heldAt(state.value, placed.keyPath);

  if (current === undefined) {
    return placedAt(owned(state, placed), {
      held: Setting.isList(setting) ? joined([], setting) : setting,
      keyPath: placed.keyPath,
    });
  }

  if (Setting.isList(setting) && Setting.isList(current)) {
    return placedAt(state, {
      held: joined(current, setting),
      keyPath: placed.keyPath,
    });
  }

  return Setting.isList(setting) || !Setting.same(current, setting)
    ? clashed(state, placed)
    : state;
};

// A map's path is marked before its pairs are placed: sorted where the entry says so, and kept
// though empty where the entry writes it so.
const marked = (state: MergeState, placed: PlacedMap): MergeState => {
  const key = keyOf(placed.keyPath);

  return {
    ...state,
    empties:
      placed.pairs.length === 0
        ? new Set([
            ...state.empties,
            key,
          ])
        : state.empties,
    sorted: placed.isSorted ? withEntry(state.sorted, key, placed.keyPath) : state.sorted,
  };
};

// A map's path opened for its pairs; where it holds a setting other than a map, it clashes and its
// pairs go nowhere.
const mapOpened = (
  state: MergeState,
  placed: PlacedMap,
): {
  readonly isOpen: boolean;
  readonly state: MergeState;
} => {
  const current = heldAt(state.value, placed.keyPath);
  const withMarks = marked(state, placed);

  if (current !== undefined && !Setting.isMap(current)) {
    return {
      isOpen: false,
      state: clashed(withMarks, placed),
    };
  }

  return {
    isOpen: true,
    state:
      current === undefined
        ? placedAt(owned(withMarks, placed), {
            held: {},
            keyPath: placed.keyPath,
          })
        : withMarks,
  };
};

// A replacer settles its path, clash or none.
const withReplacers = (state: MergeState): MergeState =>
  state.replacers.entries().reduce(
    (next, [key, { keyPath, setting }]) => ({
      ...placedAt(next, {
        held: setting,
        keyPath,
      }),
      clashes: new Map(next.clashes.entries().filter(([clashKey]) => clashKey !== key)),
    }),
    state,
  );

const withInsert = (state: MergeState, insert: Insert): MergeState => {
  const { items, list, slot } = insert;
  const target = heldAt(state.value, list);
  const details = {
    setting: Setting.pathTextOf(list),
    slot,
  };

  if (!Setting.isList(target)) {
    return withProblem(state, {
      code: PresetsCode.SlotInNoList,
      details,
    });
  }

  const at = target.findIndex((listed) => Value.slotOf(listed) === slot);

  return at < 0
    ? withProblem(state, {
        code: PresetsCode.MissingSlot,
        details,
      })
    : placedAt(state, {
        held: target.toSpliced(at + 1, 0, ...items.flat(1)),
        keyPath: list,
      });
};

const withInserts = (state: MergeState): MergeState =>
  state.inserts.values().reduce(withInsert, state);

const isKeptEmpty = (state: MergeState, keyPath: readonly string[]): boolean =>
  state.empties.has(keyOf(keyPath));

const MergeState = {
  defaulted,
  inserted,
  isKeptEmpty,
  mapOpened,
  replaced,
  settingPlaced,
  unmerged,
  withInserts,
  withReplacers,
} as const;

export type { Placed, PlacedMap, PlacedSetting };
export { MergeState };
