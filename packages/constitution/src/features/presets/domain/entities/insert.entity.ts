import type { AddressKey } from '../value-objects';
import { SettingKey } from '../value-objects';
import { PresetValue } from './preset-value.entity';
import type { MergeProblem } from './presets-finding.entity';
import { PresetsCode } from './presets-finding.entity';
import type { SettingMap } from './setting.entity';
import { Setting } from './setting.entity';

interface Insert {
  readonly items: readonly (readonly Setting[])[];
  readonly list: readonly string[];
  readonly slot: string;
}

type Filled =
  | {
      readonly problem: MergeProblem;
    }
  | {
      readonly setting: Setting;
    };

type Reached =
  | {
      readonly problem: MergeProblem;
    }
  | {
      readonly held: Setting | undefined;
      readonly placed: (setting: Setting) => Setting;
    };

const slotFilled = (held: Setting | undefined, insert: Insert): Filled => {
  const { items, list, slot } = insert;
  const details = {
    settingPath: Setting.pathTextOf(list),
    slot,
  };

  if (!Setting.isList(held)) {
    return {
      problem: {
        code: PresetsCode.SlotInNoList,
        details,
      },
    };
  }

  const at = held.findIndex((listed) => PresetValue.slotOf(listed) === slot);

  return at < 0
    ? {
        problem: {
          code: PresetsCode.MissingSlot,
          details,
        },
      }
    : {
        setting: held.toSpliced(at + 1, 0, ...items.flat(1)),
      };
};

const elementReached = (input: {
  address: AddressKey;
  map: SettingMap;
  walked: readonly string[];
}): Reached => {
  const { address, map } = input;
  const elements = map[address.list];
  const details = {
    settingPath: Setting.pathTextOf([
      ...input.walked,
      address.list,
    ]),
    slot: address.value,
  };

  if (!Setting.isList(elements)) {
    return {
      problem: {
        code: PresetsCode.SlotInNoList,
        details,
      },
    };
  }

  const [element, ...others] = elements.filter((listed) =>
    PresetValue.placesSlot(listed, address.value),
  );

  if (element === undefined || others.length > 0) {
    return {
      problem: {
        code: element === undefined ? PresetsCode.MissingSlot : PresetsCode.SlotPlacedTwice,
        details,
      },
    };
  }

  return {
    held: element,
    placed: (setting) => ({
      ...map,
      [address.list]: elements.map((listed) => (listed === element ? setting : listed)),
    }),
  };
};

const filledIn = (input: {
  held: Setting | undefined;
  insert: Insert;
  keyPath: readonly string[];
  walked: readonly string[];
}): Filled => {
  const { insert, walked } = input;
  const [key, ...rest] = input.keyPath;

  if (key === undefined) {
    return slotFilled(input.held, insert);
  }

  const map = Setting.isMap(input.held) ? input.held : {};
  const address = SettingKey.slotAddressOf(key);
  const reached: Reached =
    address === undefined
      ? {
          held: map[key],
          placed: (setting) => ({
            ...map,
            [key]: setting,
          }),
        }
      : elementReached({
          address,
          map,
          walked,
        });

  if ('problem' in reached) {
    return reached;
  }

  const filled = filledIn({
    held: reached.held,
    insert,
    keyPath: rest,
    walked: [
      ...walked,
      key,
    ],
  });

  return 'problem' in filled
    ? filled
    : {
        setting: reached.placed(filled.setting),
      };
};

const placedIn = (insert: Insert, setting: Setting | undefined): Filled =>
  filledIn({
    held: setting,
    insert,
    keyPath: insert.list,
    walked: [],
  });

const Insert = {
  placedIn,
} as const;

export { Insert };
