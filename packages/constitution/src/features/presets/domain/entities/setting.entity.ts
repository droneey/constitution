import { compareText, isDeepEqual } from '#/kernel/utils';

import type { AddressKey } from '../value-objects';
import { SettingKey } from '../value-objects';

/** A date as its text; never a null. */
type Setting = boolean | number | string | readonly Setting[] | SettingMap;

interface SettingMap {
  readonly [key: string]: Setting;
}

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

/** The first map whose field holds the value as text. */
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

const at = (setting: Setting | undefined, path: readonly string[]): Setting | undefined =>
  path.reduce<Setting | undefined>(childOf, setting);

/**
 * The setting with the path holding the value: the maps and lists on the way made where absent, an
 * addressed element found by its field or added with it, and a map placed at an address merged into
 * the element there.
 */
const withAt = (input: {
  path: readonly string[];
  setting: Setting | undefined;
  value: Setting;
}): Setting => {
  const [key, ...rest] = input.path;

  if (key === undefined) {
    return input.value;
  }

  const holder = isMap(input.setting) ? input.setting : {};
  const address = SettingKey.addressOf(key);

  if (address === undefined) {
    return {
      ...holder,
      [key]: withAt({
        path: rest,
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
          path: rest,
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

/** One text whatever the order of its maps' keys, so equal settings give the same text. */
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

const Setting = {
  addressedIn,
  at,
  canonicalTextOf,
  isList,
  isMap,
  isScalar,
  same,
  withAt,
} as const;

export type { Addressed, SettingMap };
export { Setting };
