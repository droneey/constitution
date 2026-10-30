import { SLOT_KEY } from '../../shared/constants';
import { KeyKind, SettingKey } from '../../shared/value-objects';
import { Setting } from './setting.entity';

enum ValueKind {
  Map = 'map',
  Plain = 'plain',
  Replace = 'replace',
  Default = 'default',
}

interface PresetPair {
  readonly key: string;
  readonly value: PresetValue;
}

type PresetValue =
  | {
      readonly isWords: boolean;
      readonly kind: ValueKind.Default | ValueKind.Plain | ValueKind.Replace;
      readonly setting: Setting;
    }
  | {
      readonly isSorted: boolean;
      readonly kind: ValueKind.Map;
      readonly pairs: readonly PresetPair[];
    };

const slotOf = (listed: Setting): string | undefined => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: a text or a list holds no slot key either
  if (!Setting.isMap(listed)) {
    return undefined;
  }

  const name = listed[SLOT_KEY];

  return Object.keys(listed).length === 1 && typeof name === 'string' ? name : undefined;
};

const placesSlot = (element: Setting, slot: string): boolean =>
  Setting.isMap(element) &&
  Object.values(element).some(
    (held) => Setting.isList(held) && held.some((listed) => slotOf(listed) === slot),
  );

const withoutSlots = (setting: Setting): Setting => {
  if (Setting.isList(setting)) {
    return setting.filter((listed) => slotOf(listed) === undefined).map(withoutSlots);
  }

  return Setting.isMap(setting)
    ? Object.fromEntries(
        Object.entries(setting).map(([key, held]) => [
          key,
          withoutSlots(held),
        ]),
      )
    : setting;
};

const isListFilledFrom = (given: readonly Setting[], held: readonly Setting[]): boolean => {
  const [first, ...rest] = given;

  if (first === undefined) {
    return held.length === 0;
  }

  if (slotOf(first) !== undefined) {
    return [
      ...held.keys(),
      held.length,
    ].some((filled) => isListFilledFrom(rest, held.slice(filled)));
  }

  const [next, ...others] = held;

  return isFilledFrom(first, next) && isListFilledFrom(rest, others);
};

const isFilledFrom = (given: Setting, held: Setting | undefined): boolean => {
  if (Setting.isList(given)) {
    return Setting.isList(held) && isListFilledFrom(given, held);
  }

  if (Setting.isMap(given)) {
    return (
      Setting.isMap(held) &&
      Object.keys(held).length === Object.keys(given).length &&
      Object.entries(given).every(([key, listed]) => isFilledFrom(listed, held[key]))
    );
  }

  return Setting.same(given, held);
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
  isWords: false,
  kind: ValueKind.Plain,
  setting,
});

const wordsOf = (words: readonly Setting[]): PresetValue => ({
  isWords: true,
  kind: ValueKind.Plain,
  setting: words,
});

const mapOf = (pairs: readonly PresetPair[]): PresetValue => ({
  isSorted: false,
  kind: ValueKind.Map,
  pairs,
});

const sortedMapOf = (pairs: readonly PresetPair[]): PresetValue => ({
  isSorted: true,
  kind: ValueKind.Map,
  pairs,
});

const PresetValue = {
  isFilledFrom,
  isInsertOnly,
  itemsOf,
  mapOf,
  placesSlot,
  plain,
  settingOf,
  slotOf,
  sortedMapOf,
  withoutSlots,
  wordsOf,
} as const;

export type { PresetPair };
export { PresetValue, ValueKind };
