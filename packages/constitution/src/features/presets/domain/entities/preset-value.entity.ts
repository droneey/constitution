import { KeyKind, SettingKey } from '../value-objects';
import { Setting } from './setting.entity';

enum ValueKind {
  Map = 'map',
  /** a scalar or a list, written as it is; a list item `{slot: <name>}` is a slot */
  Plain = 'plain',
  /** `!replace`: the value replaces whatever the other entries give its path */
  Replace = 'replace',
  /** `!default`: the value is written only where the file holds nothing, and never checked */
  Default = 'default',
}

interface PresetPair {
  readonly key: string;
  readonly value: PresetValue;
}

type PresetValue =
  | {
      readonly kind: ValueKind.Default | ValueKind.Plain | ValueKind.Replace;
      readonly setting: Setting;
    }
  | {
      readonly kind: ValueKind.Map;
      readonly pairs: readonly PresetPair[];
    };

const SLOT_KEY = 'slot';

/** The slot a list item places, `{slot: <name>}`, whose name inserts address as `list@<name>`. */
const slotOf = (listed: Setting): string | undefined => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: a text or a list holds no slot key either
  if (!Setting.isMap(listed)) {
    return undefined;
  }

  const name = listed[SLOT_KEY];

  return Object.keys(listed).length === 1 && typeof name === 'string' ? name : undefined;
};

const settingOf = (given: PresetValue): Setting =>
  given.kind === ValueKind.Map
    ? Object.fromEntries(
        given.pairs.map(
          (
            pair,
          ): [
            string,
            Setting,
          ] => [
            pair.key,
            settingOf(pair.value),
          ],
        ),
      )
    : given.setting;

/** A list item, or the map of a pair, as the item it inserts. */
const itemsOf = (given: PresetValue): readonly Setting[] => {
  const setting = settingOf(given);

  return Setting.isList(setting)
    ? setting
    : [
        setting,
      ];
};

const isInsertOnly = (given: PresetValue): boolean =>
  given.kind === ValueKind.Map &&
  given.pairs.length > 0 &&
  given.pairs.every(
    (pair) => SettingKey.of(pair.key).kind === KeyKind.Insert || isInsertOnly(pair.value),
  );

const plain = (setting: Setting): PresetValue => ({
  kind: ValueKind.Plain,
  setting,
});

const mapOf = (pairs: readonly PresetPair[]): PresetValue => ({
  kind: ValueKind.Map,
  pairs,
});

const PresetValue = {
  isInsertOnly,
  itemsOf,
  mapOf,
  plain,
  settingOf,
  slotOf,
} as const;

export type { PresetPair };
export { PresetValue, ValueKind };
