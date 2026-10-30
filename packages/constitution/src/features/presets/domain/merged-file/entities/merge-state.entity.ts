import type { PresetPair, PresetValue } from '../../setting/entities';
import { Setting, PresetValue as Value } from '../../setting/entities';
import type { MergeProblem } from '../../shared/entities';
import { PresetsCode } from '../../shared/entities';
import { Insert } from './insert.entity';

interface Replacer {
  readonly keyPath: readonly string[];
  readonly setting: Setting;
  readonly source: string;
}

// Why: each step gives a new state, copying the collection it changes: a merge of a file's few
// hundred paths costs milliseconds more than one that mutates, and no step sees another's state
// change under it.
interface MergeState {
  readonly clashes: ReadonlyMap<string, MergeProblem>;
  readonly defaults: readonly {
    readonly keyPath: readonly string[];
    readonly value: Setting;
  }[];
  readonly inserts: ReadonlyMap<string, Insert>;
  readonly keptEmptyMaps: ReadonlySet<string>;
  readonly owners: ReadonlyMap<string, string>;
  readonly problems: readonly MergeProblem[];
  readonly replacers: ReadonlyMap<string, Replacer>;
  readonly sorted: ReadonlyMap<string, readonly string[]>;
  readonly unitedWholeDefault?: Setting;
  readonly value?: Setting;
}

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
  inserts: new Map(),
  keptEmptyMaps: new Set(),
  owners: new Map(),
  problems: [],
  replacers: new Map(),
  sorted: new Map(),
};

// Stryker disable next-line StringLiteral: any text that no key path's JSON spells keeps it apart
const WHOLE_OWNER = 'whole';

const keyOf = (keyPath: readonly string[]): string => JSON.stringify(keyPath);

const withEntryKeepingItsPlace = <TKey, TValue>(
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

const placedAt = (
  state: MergeState,
  input: {
    held: Setting;
    keyPath: readonly string[];
  },
): MergeState => ({
  ...state,
  value: Setting.withAtKeysAsWritten({
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
  clashes: withEntryKeepingItsPlace(state.clashes, key, {
    code: PresetsCode.Clash,
    details: {
      settingPath: Setting.pathTextOf(placed.keyPath),
      sources: [
        state.owners.get(key) ?? placed.source,
        placed.source,
      ],
    },
  }),
});

const ownedByFirstWriter = (
  state: MergeState,
  placed: Placed,
  key: string = keyOf(placed.keyPath),
): MergeState => ({
  ...state,
  owners: withEntryKeepingItsPlace(state.owners, key, placed.source),
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
      replacers: withEntryKeepingItsPlace(state.replacers, key, {
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
          settingPath: Setting.pathTextOf(placed.keyPath),
          sources: [
            before.source,
            placed.source,
          ],
        },
      });
};

const withItemsNotYetHeld = (
  current: readonly Setting[],
  items: readonly Setting[],
): readonly Setting[] => [
  ...current,
  ...items.filter((listed) => !current.some((known) => Setting.same(known, listed))),
];

const wholeDefaultsUnited = (state: MergeState, placed: PlacedSetting): MergeState => {
  const { unitedWholeDefault } = state;
  const { setting } = placed;

  if (unitedWholeDefault === undefined) {
    return {
      ...ownedByFirstWriter(state, placed, WHOLE_OWNER),
      unitedWholeDefault: setting,
    };
  }

  if (Setting.isList(unitedWholeDefault) && Setting.isList(setting)) {
    return {
      ...state,
      unitedWholeDefault: withItemsNotYetHeld(unitedWholeDefault, setting),
    };
  }

  if (Setting.isMap(unitedWholeDefault) && Setting.isMap(setting)) {
    return {
      ...state,
      unitedWholeDefault: {
        ...unitedWholeDefault,
        ...setting,
      },
    };
  }

  return Setting.same(unitedWholeDefault, setting) ? state : clashed(state, placed, WHOLE_OWNER);
};

const defaulted = (state: MergeState, placed: PlacedSetting): MergeState => {
  const { keyPath, setting } = placed;

  if (keyPath.length === 0) {
    return wholeDefaultsUnited(state, placed);
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
    inserts: withEntryKeepingItsPlace(
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
  const current = Setting.atKeysAsWritten(state.value, placed.keyPath);

  if (current === undefined) {
    return placedAt(ownedByFirstWriter(state, placed), {
      held: setting,
      keyPath: placed.keyPath,
    });
  }

  if (Setting.isList(setting) && Setting.isList(current)) {
    return placedAt(state, {
      held: withItemsNotYetHeld(current, setting),
      keyPath: placed.keyPath,
    });
  }

  return Setting.isList(setting) || !Setting.same(current, setting)
    ? clashed(state, placed)
    : state;
};

const mapMarked = (state: MergeState, placed: PlacedMap): MergeState => {
  const key = keyOf(placed.keyPath);

  return {
    ...state,
    keptEmptyMaps:
      placed.pairs.length === 0
        ? new Set([
            ...state.keptEmptyMaps,
            key,
          ])
        : state.keptEmptyMaps,
    sorted: placed.isSorted
      ? withEntryKeepingItsPlace(state.sorted, key, placed.keyPath)
      : state.sorted,
  };
};

const mapOpened = (
  state: MergeState,
  placed: PlacedMap,
): {
  readonly isOpen: boolean;
  readonly state: MergeState;
} => {
  const current = Setting.atKeysAsWritten(state.value, placed.keyPath);
  const withMarks = mapMarked(state, placed);

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
        ? placedAt(ownedByFirstWriter(withMarks, placed), {
            held: {},
            keyPath: placed.keyPath,
          })
        : withMarks,
  };
};

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
  const filled = Insert.placedIn(insert, state.value);

  return 'problem' in filled
    ? withProblem(state, filled.problem)
    : {
        ...state,
        value: filled.setting,
      };
};

const withInserts = (state: MergeState): MergeState =>
  state.inserts.values().reduce(withInsert, state);

const isKeptEmpty = (state: MergeState, keyPath: readonly string[]): boolean =>
  state.keptEmptyMaps.has(keyOf(keyPath));

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
