import { compareText, isDeepEqual } from '#/kernel/utils';

import type { AddressKey } from '../../value-objects';
import { SettingKey } from '../../value-objects';

type Setting = boolean | number | string | readonly Setting[] | SettingMap;

interface SettingMap {
  readonly [key: string]: Setting;
}

const KEY_SEPARATOR = '.';

const isMap = (setting: Setting | undefined): setting is SettingMap =>
  typeof setting === 'object' && !Array.isArray(setting);

const isList = (setting: Setting | undefined): setting is readonly Setting[] =>
  Array.isArray(setting);

const isScalar = (setting: Setting | undefined): setting is boolean | number | string =>
  setting !== undefined && typeof setting !== 'object';

const same = (left: Setting | undefined, right: Setting | undefined): boolean =>
  isDeepEqual(left, right);

interface Addressed {
  readonly element: SettingMap;
  readonly list: readonly Setting[];
}

const addressedIn = (holder: Setting | undefined, key: AddressKey): Addressed | undefined => {
  const list = isMap(holder) ? holder[key.list] : undefined;

  if (!isList(list)) {
    return undefined;
  }

  const element = list.filter(isMap).find((listed) => {
    const held = listed[key.field];

    return isScalar(held) && String(held) === key.value;
  });

  return element === undefined
    ? undefined
    : {
        element,
        list,
      };
};

const childOf = (holder: Setting | undefined, key: string): Setting | undefined => {
  const address = SettingKey.addressOf(key);

  if (address !== undefined) {
    return addressedIn(holder, address)?.element;
  }

  return isMap(holder) ? holder[key] : undefined;
};

const at = (setting: Setting | undefined, keyPath: readonly string[]): Setting | undefined =>
  keyPath.reduce<Setting | undefined>(childOf, setting);

const atKeysAsWritten = (
  setting: Setting | undefined,
  keyPath: readonly string[],
): Setting | undefined =>
  keyPath.reduce<Setting | undefined>(
    (held, key) => (isMap(held) ? held[key] : undefined),
    setting,
  );

const withAtKeysAsWritten = (input: {
  held: Setting;
  keyPath: readonly string[];
  setting: Setting | undefined;
}): Setting => {
  const [key, ...rest] = input.keyPath;

  if (key === undefined) {
    return input.held;
  }

  const map = isMap(input.setting) ? input.setting : {};

  return {
    ...map,
    [key]: withAtKeysAsWritten({
      held: input.held,
      keyPath: rest,
      setting: map[key],
    }),
  };
};

const withAt = (input: {
  keyPath: readonly string[];
  setting: Setting | undefined;
  value: Setting;
}): Setting => {
  const [key, ...rest] = input.keyPath;

  if (key === undefined) {
    return input.value;
  }

  const holder = isMap(input.setting) ? input.setting : {};
  const address = SettingKey.addressOf(key);

  if (address === undefined) {
    return {
      ...holder,
      [key]: withAt({
        keyPath: rest,
        setting: holder[key],
        value: input.value,
      }),
    };
  }

  const found = addressedIn(holder, address);
  const held = holder[address.list];
  const list = isList(held) ? held : [];
  const base = found?.element ?? {
    [address.field]: address.value,
  };
  const placed =
    rest.length === 0 && isMap(input.value)
      ? {
          ...base,
          ...input.value,
        }
      : withAt({
          keyPath: rest,
          setting: base,
          value: input.value,
        });

  return {
    ...holder,
    [address.list]:
      found === undefined
        ? [
            ...list,
            placed,
          ]
        : list.map((listed) => (listed === found.element ? placed : listed)),
  };
};

const canonicalTextOf = (setting: Setting): string => {
  if (isList(setting)) {
    return `[${setting.map(canonicalTextOf).join(',')}]`;
  }

  if (isMap(setting)) {
    return `{${Object.entries(setting)
      .toSorted(([left], [right]) => compareText(left, right))
      .map(([key, held]) => `${JSON.stringify(key)}:${canonicalTextOf(held)}`)
      .join(',')}}`;
  }

  return JSON.stringify(setting);
};

const pathTextOf = (keyPath: readonly string[]): string => keyPath.join(KEY_SEPARATOR);

const Setting = {
  addressedIn,
  at,
  atKeysAsWritten,
  canonicalTextOf,
  isList,
  isMap,
  isScalar,
  pathTextOf,
  same,
  withAt,
  withAtKeysAsWritten,
} as const;

export type { Addressed, SettingMap };
export { Setting };
