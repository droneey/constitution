import type { PresetValue } from '../../../entities';
import { Setting, ValueKind } from '../../../entities';

enum TextPlace {
  /** the file an entry writes, which names no fact but a role */
  Path = 'path',
  Key = 'key',
  Value = 'value',
  Item = 'item',
  /** a whole file's text, written as a default: the file itself, whose names are its own */
  File = 'file',
}

interface EntryText {
  readonly place: TextPlace;
  readonly text: string;
}

const textsOfSetting = (setting: Setting, place: TextPlace): readonly EntryText[] => {
  if (Setting.isList(setting)) {
    return setting.flatMap((listed) => textsOfSetting(listed, TextPlace.Item));
  }

  if (Setting.isMap(setting)) {
    return Object.entries(setting).flatMap(([key, held]) => [
      {
        place: TextPlace.Key,
        text: key,
      },
      ...textsOfSetting(held, TextPlace.Value),
    ]);
  }

  return typeof setting === 'string'
    ? [
        {
          place,
          text: setting,
        },
      ]
    : [];
};

const textsOfValue = (given: PresetValue): readonly EntryText[] =>
  given.kind === ValueKind.Map
    ? given.pairs.flatMap((pair) => [
        {
          place: TextPlace.Key,
          text: pair.key,
        },
        ...textsOfValue(pair.value),
      ])
    : textsOfSetting(given.setting, TextPlace.Value);

const textsOf = (given: PresetValue): readonly EntryText[] =>
  given.kind === ValueKind.Default && typeof given.setting === 'string'
    ? [
        {
          place: TextPlace.File,
          text: given.setting,
        },
      ]
    : textsOfValue(given);

export type { EntryText };
export { TextPlace, textsOf };
