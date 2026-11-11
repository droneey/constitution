import { SLOT_KEY } from '../../shared/constants';
import { KeyKind, SettingKey } from '../../shared/value-objects';
import { Setting } from './setting.entity';

enum ValueKind {
  Map = 'map',
  Plain = 'plain',
  Replace = 'replace',
  Default = 'default',
  Inherit = 'inherit',
  Copy = 'copy',
}

// Why: a list is written as it is, joined into one text of words, or joined into one command line of
// commands.
enum Joining {
  None = 'none',
  Words = 'words',
  Commands = 'commands',
}

// Why: a map is merged as it is, kept with its keys sorted, or marks the settings that hold their rule
// whole.
enum MapForm {
  Plain = 'plain',
  Sorted = 'sorted',
  Whole = 'whole',
}

interface PresetPair {
  readonly key: string;
  readonly value: PresetValue;
}

type PresetValue =
  | {
      readonly joining: Joining;
      readonly kind:
        | ValueKind.Copy
        | ValueKind.Default
        | ValueKind.Inherit
        | ValueKind.Plain
        | ValueKind.Replace;
      readonly setting: Setting;
    }
  | {
      readonly form: MapForm;
      readonly kind: ValueKind.Map;
      readonly pairs: readonly PresetPair[];
    };

const slotOf = (listed: Setting): string | undefined => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: a text or a list holds no slot key either
  if (!Setting.isMap(listed)) {
    return;
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
  joining: Joining.None,
  kind: ValueKind.Plain,
  setting,
});

const wordsOf = (words: readonly Setting[]): PresetValue => ({
  joining: Joining.Words,
  kind: ValueKind.Plain,
  setting: words,
});

const commandsOf = (commands: readonly Setting[]): PresetValue => ({
  joining: Joining.Commands,
  kind: ValueKind.Plain,
  setting: commands,
});

const mapOf = (pairs: readonly PresetPair[]): PresetValue => ({
  form: MapForm.Plain,
  kind: ValueKind.Map,
  pairs,
});

const sortedMapOf = (pairs: readonly PresetPair[]): PresetValue => ({
  form: MapForm.Sorted,
  kind: ValueKind.Map,
  pairs,
});

const wholeMapOf = (pairs: readonly PresetPair[]): PresetValue => ({
  form: MapForm.Whole,
  kind: ValueKind.Map,
  pairs,
});

const isWhole = (given: PresetValue): boolean =>
  // Stryker disable next-line ConditionalExpression: only a map carries the whole mark, so the test of its kind only narrows the type
  given.kind === ValueKind.Map && given.form === MapForm.Whole;

const PresetValue = {
  commandsOf,
  isFilledFrom,
  isInsertOnly,
  isWhole,
  itemsOf,
  mapOf,
  placesSlot,
  plain,
  settingOf,
  slotOf,
  sortedMapOf,
  wholeMapOf,
  withoutSlots,
  wordsOf,
} as const;

export type { PresetPair };
export { Joining, MapForm, PresetValue, ValueKind };
