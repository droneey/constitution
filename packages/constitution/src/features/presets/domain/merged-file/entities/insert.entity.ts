import type { SettingMap } from '../../setting/entities';
import { PresetValue, Setting } from '../../setting/entities';
import type { MergeProblem } from '../../shared/entities';
import { PresetsCode } from '../../shared/entities';
import type { AddressKey } from '../../shared/value-objects';
import { SettingKey } from '../../shared/value-objects';

interface Insert {
  readonly items: readonly (readonly Setting[])[];
  readonly list: readonly string[];
  // Why: the source of the insert marked to replace, which then stands for every other insert of
  // the slot.
  readonly replacer?: string;
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

  const filled = itemsPlacedAtSlot(held, {
    items: items.flat(1),
    slot,
  });

  return filled === undefined
    ? {
        problem: {
          code: PresetsCode.MissingSlot,
          details,
        },
      }
    : {
        setting: filled,
      };
};

// Why: a list of commands holds each command's words as a list of its own, whose slot is filled
// as one in the list itself is.
const itemsPlacedAtSlot = (
  list: readonly Setting[],
  insert: {
    items: readonly Setting[];
    slot: string;
  },
): Setting[] | undefined => {
  const at = list.findIndex((listed) => PresetValue.slotOf(listed) === insert.slot);

  if (at >= 0) {
    return list.toSpliced(at + 1, 0, ...insert.items);
  }

  const placed = list.map((listed) =>
    Setting.isList(listed) ? itemsPlacedAtSlot(listed, insert) : undefined,
  );
  const index = placed.findIndex((filled) => filled !== undefined);
  const nested = placed[index];

  return nested === undefined ? undefined : list.with(index, nested);
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
