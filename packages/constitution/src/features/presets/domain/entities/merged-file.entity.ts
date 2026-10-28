import type { BlockId } from '#/kernel/value-objects';

import { KeyKind, SettingKey } from '../value-objects';
import type { Placed, PlacedMap, PlacedSetting } from './merge-state.entity';
import { MergeState } from './merge-state.entity';
import type { PresetPair, PresetValue } from './preset-value.entity';
import { PresetValue as Value, ValueKind } from './preset-value.entity';
import type { MergeProblem } from './presets-finding.entity';
import { Setting } from './setting.entity';
import { WholeDefault } from './whole-default.entity';

interface Contribution {
  readonly block: BlockId;
  readonly source: string;
  readonly value: PresetValue;
}

/** A setting written only where the file holds nothing at its path, and never checked. */
type DefaultSetting = MergeState['defaults'][number];

interface MergedFile {
  readonly defaults: readonly DefaultSetting[];
  readonly problems: readonly MergeProblem[];
  /** the paths of the maps whose keys the file keeps sorted */
  readonly sorted?: readonly (readonly string[])[];
  /** what the entries write; absent where they write only defaults */
  readonly value?: Setting;
  readonly whole?: WholeDefault;
}

interface PlacedValue extends Placed {
  readonly value: PresetValue;
}

const placers: Readonly<
  Record<
    ValueKind.Default | ValueKind.Plain | ValueKind.Replace,
    (state: MergeState, placed: PlacedSetting) => MergeState
  >
> = {
  [ValueKind.Default]: MergeState.defaulted,
  [ValueKind.Plain]: MergeState.settingPlaced,
  [ValueKind.Replace]: MergeState.replaced,
};

const mapPlaced = (state: MergeState, placed: PlacedMap): MergeState => {
  const opened = MergeState.mapOpened(state, placed);

  return opened.isOpen
    ? placed.pairs.reduce((next, pair) => pairPlaced(next, placed, pair), opened.state)
    : opened.state;
};

const pairPlaced = (state: MergeState, map: Placed, pair: PresetPair): MergeState => {
  const key = SettingKey.of(pair.key);

  return key.kind === KeyKind.Insert
    ? MergeState.inserted(state, {
        list: [
          ...map.keyPath,
          key.list,
        ],
        slot: key.slot,
        value: pair.value,
      })
    : valuePlaced(state, {
        keyPath: [
          ...map.keyPath,
          pair.key,
        ],
        source: map.source,
        value: pair.value,
      });
};

const valuePlaced = (state: MergeState, placed: PlacedValue): MergeState => {
  const { value: given } = placed;

  return given.kind === ValueKind.Map
    ? mapPlaced(state, {
        ...placed,
        isSorted: given.isSorted,
        pairs: given.pairs,
      })
    : placers[given.kind](state, {
        ...placed,
        setting: given.setting,
      });
};

// What the merge leaves: no slot, and no map that only defaults or inserts opened, which would write
// an empty one where the file holds nothing.
const settled = (input: {
  keyPath: readonly string[];
  merged: MergeState;
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
        const keyPath = [
          ...input.keyPath,
          key,
        ];
        const kept = settled({
          ...input,
          keyPath,
          setting: held,
        });
        const isEmptyMap = Setting.isMap(kept) && Object.keys(kept).length === 0;
        const isOpenedOnly = isEmptyMap && !MergeState.isKeptEmpty(input.merged, keyPath);

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
  const placed = contributions.reduce(
    (state, contribution) =>
      valuePlaced(state, {
        keyPath: [],
        source: contribution.source,
        value: contribution.value,
      }),
    MergeState.unmerged,
  );
  const merged = MergeState.withInserts(MergeState.withReplacers(placed));
  const { clashes, defaults, problems, sorted, value: written, whole } = merged;
  const wholeDefault = WholeDefault.of(whole);

  return {
    defaults,
    problems: [
      ...clashes.values(),
      ...problems,
    ],
    ...(written === undefined
      ? {}
      : {
          value: settled({
            keyPath: [],
            merged,
            setting: written,
          }),
        }),
    ...(sorted.size === 0
      ? {}
      : {
          sorted: [
            ...sorted.values(),
          ],
        }),
    ...(wholeDefault === undefined
      ? {}
      : {
          whole: wholeDefault,
        }),
  };
};

const MergedFile = {
  merge,
} as const;

export type { Contribution, DefaultSetting };
export { MergedFile };
