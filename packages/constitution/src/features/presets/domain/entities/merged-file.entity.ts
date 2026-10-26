import { KeyKind, SettingKey } from '../value-objects';
import type { PresetPair, PresetValue } from './preset-value.entity';
import { PresetValue as Value, ValueKind } from './preset-value.entity';
import type { MergeProblem } from './presets-finding.entity';
import { PresetsCode } from './presets-finding.entity';
import { Setting } from './setting.entity';

interface Contribution {
  readonly block: string;
  readonly source: string;
  readonly value: PresetValue;
}

/** A setting written only where the file holds nothing at its path, and never checked. */
interface DefaultSetting {
  readonly path: readonly string[];
  readonly value: Setting;
}

interface MergedFile {
  readonly defaults: readonly DefaultSetting[];
  readonly problems: readonly MergeProblem[];
  /** the paths of the maps whose keys the file keeps sorted */
  readonly sorted?: readonly (readonly string[])[];
  /** what the entries write; absent where they write only defaults */
  readonly value?: Setting;
  /** the file as a default, written while it is absent: a text, or its lines or keys added */
  readonly whole?: Setting;
}

interface Insert {
  readonly items: (readonly Setting[])[];
  readonly list: readonly string[];
  readonly slot: string;
}

interface Replacer {
  readonly path: readonly string[];
  readonly setting: Setting;
  readonly source: string;
}

enum Part {
  Value = 'value',
  Whole = 'whole',
}

interface MergeState {
  readonly clashes: Map<string, MergeProblem>;
  readonly defaults: DefaultSetting[];
  /** the paths an entry writes as an empty map, which stay though nothing fills them */
  readonly empties: Set<string>;
  readonly inserts: Map<string, Insert>;
  readonly owners: Map<string, string>;
  readonly parts: Map<Part, Setting>;
  readonly problems: MergeProblem[];
  readonly replacers: Map<string, Replacer>;
  /** the paths of the maps an entry marks sorted */
  readonly sorted: Map<string, readonly string[]>;
}

interface PlaceInput {
  readonly path: readonly string[];
  readonly source: string;
  readonly state: MergeState;
}

interface SettingInput extends PlaceInput {
  readonly setting: Setting;
}

const DOT = '.';
// The owner of the file as a default, kept apart from the owner of its value's root.
const wholeOwner = Part.Whole;

const keyOf = (path: readonly string[]): string => JSON.stringify(path);

// A key here is the preset file's own, an address among them: the merge never reads one through a list.
const heldAt = (setting: Setting | undefined, path: readonly string[]): Setting | undefined =>
  path.reduce<Setting | undefined>(
    (held, key) => (Setting.isMap(held) ? held[key] : undefined),
    setting,
  );

const withHeldAt = (input: {
  held: Setting;
  path: readonly string[];
  setting: Setting | undefined;
}): Setting => {
  const [key, ...rest] = input.path;

  if (key === undefined) {
    return input.held;
  }

  const map = Setting.isMap(input.setting) ? input.setting : {};

  return {
    ...map,
    [key]: withHeldAt({
      held: input.held,
      path: rest,
      setting: map[key],
    }),
  };
};

const writtenOf = (state: MergeState): Setting | undefined => state.parts.get(Part.Value);

const placeAt = (input: { held: Setting; path: readonly string[]; state: MergeState }): void => {
  input.state.parts.set(
    Part.Value,
    withHeldAt({
      held: input.held,
      path: input.path,
      setting: writtenOf(input.state),
    }),
  );
};

const clash = (input: PlaceInput, key: string = keyOf(input.path)): void => {
  input.state.clashes.set(key, {
    code: PresetsCode.Clash,
    details: {
      setting: input.path.join(DOT),
      sources: [
        input.state.owners.get(key) ?? input.source,
        input.source,
      ],
    },
  });
};

// Called only where the path is first written, so the owner is the first source that wrote it.
const own = (input: PlaceInput, key: string = keyOf(input.path)): void => {
  input.state.owners.set(key, input.source);
};

const replace = (input: SettingInput): void => {
  const key = keyOf(input.path);
  const before = input.state.replacers.get(key);

  if (before === undefined) {
    input.state.replacers.set(key, input);
  } else if (!Setting.same(before.setting, input.setting)) {
    input.state.problems.push({
      code: PresetsCode.TwoReplacers,
      details: {
        setting: input.path.join(DOT),
        sources: [
          before.source,
          input.source,
        ],
      },
    });
  }
};

// Several whole-file defaults unite as their values do: lines and keys join, two texts clash.
const uniteWhole = (input: SettingInput): void => {
  const { setting, state } = input;
  const whole = state.parts.get(Part.Whole);

  if (whole === undefined) {
    own(input, wholeOwner);
    state.parts.set(Part.Whole, setting);
  } else if (Setting.isList(whole) && Setting.isList(setting)) {
    state.parts.set(Part.Whole, [
      ...whole,
      ...setting.filter((line) => !whole.some((known) => Setting.same(known, line))),
    ]);
  } else if (Setting.isMap(whole) && Setting.isMap(setting)) {
    state.parts.set(Part.Whole, {
      ...whole,
      ...setting,
    });
  } else if (!Setting.same(whole, setting)) {
    clash(input, wholeOwner);
  }
};

const addDefault = (input: SettingInput): void => {
  const { path, setting, state } = input;

  if (path.length === 0) {
    uniteWhole(input);
  } else if (
    !state.defaults.some(
      (known) => Setting.same(known.path, path) && Setting.same(known.value, setting),
    )
  ) {
    state.defaults.push({
      path,
      value: setting,
    });
  }
};

// An insert is kept whole: the same insert from two entries goes in once.
const insert = (input: {
  list: readonly string[];
  slot: string;
  state: MergeState;
  value: PresetValue;
}): void => {
  const key = keyOf([
    ...input.list,
    input.slot,
  ]);
  const record = input.state.inserts.get(key) ?? {
    items: [],
    list: input.list,
    slot: input.slot,
  };
  const items = Value.itemsOf(input.value);

  input.state.inserts.set(key, record);

  if (!record.items.some((known) => Setting.same(known, items))) {
    record.items.push(items);
  }
};

// The items of an entry join the list once each, but an item the entry itself repeats stays repeated.
const joined = (current: readonly Setting[], items: readonly Setting[]): readonly Setting[] => [
  ...current,
  ...items.filter((listed) => !current.some((known) => Setting.same(known, listed))),
];

const placeSetting = (input: SettingInput): void => {
  const { setting } = input;
  const current = heldAt(writtenOf(input.state), input.path);

  if (current === undefined) {
    own(input);
    placeAt({
      ...input,
      held: Setting.isList(setting) ? joined([], setting) : setting,
    });
  } else if (Setting.isList(setting) && Setting.isList(current)) {
    placeAt({
      ...input,
      held: joined(current, setting),
    });
  } else if (Setting.isList(setting) || !Setting.same(current, setting)) {
    clash(input);
  }
};

const placeMap = (
  input: PlaceInput & {
    isSorted: boolean;
    pairs: readonly PresetPair[];
  },
): void => {
  const current = heldAt(writtenOf(input.state), input.path);

  if (input.isSorted) {
    input.state.sorted.set(keyOf(input.path), input.path);
  }

  if (input.pairs.length === 0) {
    input.state.empties.add(keyOf(input.path));
  }

  if (current === undefined) {
    own(input);
    placeAt({
      ...input,
      held: {},
    });
  } else if (!Setting.isMap(current)) {
    clash(input);

    return;
  }

  for (const pair of input.pairs) {
    const key = SettingKey.of(pair.key);

    if (key.kind === KeyKind.Insert) {
      insert({
        list: [
          ...input.path,
          key.list,
        ],
        slot: key.slot,
        state: input.state,
        value: pair.value,
      });
    } else {
      place({
        ...input,
        path: [
          ...input.path,
          pair.key,
        ],
        value: pair.value,
      });
    }
  }
};

const placers: Readonly<
  Record<ValueKind.Default | ValueKind.Plain | ValueKind.Replace, (input: SettingInput) => void>
> = {
  [ValueKind.Default]: addDefault,
  [ValueKind.Plain]: placeSetting,
  [ValueKind.Replace]: replace,
};

const place = (
  input: PlaceInput & {
    value: PresetValue;
  },
): void => {
  const { value: given } = input;

  if (given.kind === ValueKind.Map) {
    placeMap({
      ...input,
      isSorted: given.isSorted === true,
      pairs: given.pairs,
    });
  } else {
    placers[given.kind]({
      ...input,
      setting: given.setting,
    });
  }
};

const applyReplacers = (state: MergeState): void => {
  for (const { path, setting } of state.replacers.values()) {
    placeAt({
      held: setting,
      path,
      state,
    });
    state.clashes.delete(keyOf(path));
  }
};

const applyInsert = (input: { insert: Insert; state: MergeState }): void => {
  const { items, list, slot } = input.insert;
  const target = heldAt(writtenOf(input.state), list);
  const details = {
    setting: list.join(DOT),
    slot,
  };

  if (!Setting.isList(target)) {
    input.state.problems.push({
      code: PresetsCode.SlotInNoList,
      details,
    });

    return;
  }

  const at = target.findIndex((listed) => Value.slotOf(listed) === slot);

  if (at < 0) {
    input.state.problems.push({
      code: PresetsCode.MissingSlot,
      details,
    });

    return;
  }

  placeAt({
    held: target.toSpliced(at + 1, 0, ...items.flat(1)),
    path: list,
    state: input.state,
  });
};

const applyInserts = (state: MergeState): void => {
  for (const pending of state.inserts.values()) {
    applyInsert({
      insert: pending,
      state,
    });
  }
};

// What the merge leaves: no slot, and no map that only defaults or inserts opened, which would write
// an empty one where the file holds nothing.
const settled = (input: {
  empties: ReadonlySet<string>;
  path: readonly string[];
  setting: Setting;
}): Setting => {
  const { setting } = input;

  if (Setting.isList(setting)) {
    return setting.filter((listed) => Value.slotOf(listed) === undefined);
  }

  if (!Setting.isMap(setting)) {
    return setting;
  }

  return Object.fromEntries(
    Object.entries(setting).flatMap(
      ([key, held]): [
        string,
        Setting,
      ][] => {
        const path = [
          ...input.path,
          key,
        ];
        const kept = settled({
          ...input,
          path,
          setting: held,
        });
        const isOpenedOnly =
          Setting.isMap(kept) && Object.keys(kept).length === 0 && !input.empties.has(keyOf(path));

        return isOpenedOnly
          ? []
          : [
              [
                key,
                kept,
              ],
            ];
      },
    ),
  );
};

const merge = (contributions: readonly Contribution[]): MergedFile => {
  const state: MergeState = {
    clashes: new Map(),
    defaults: [],
    empties: new Set(),
    inserts: new Map(),
    owners: new Map(),
    parts: new Map(),
    problems: [],
    replacers: new Map(),
    sorted: new Map(),
  };

  for (const contribution of contributions) {
    place({
      path: [],
      source: contribution.source,
      state,
      value: contribution.value,
    });
  }

  applyReplacers(state);
  applyInserts(state);

  const merged = writtenOf(state);
  const whole = state.parts.get(Part.Whole);

  return {
    defaults: state.defaults,
    problems: [
      ...state.clashes.values(),
      ...state.problems,
    ],
    ...(merged === undefined
      ? {}
      : {
          value: settled({
            empties: state.empties,
            path: [],
            setting: merged,
          }),
        }),
    ...(state.sorted.size === 0
      ? {}
      : {
          sorted: [
            ...state.sorted.values(),
          ],
        }),
    ...(whole === undefined
      ? {}
      : {
          whole,
        }),
  };
};

const MergedFile = {
  merge,
} as const;

export type { Contribution, DefaultSetting };
export { MergedFile };
