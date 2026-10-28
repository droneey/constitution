import type { AddressKey } from '../value-objects';
import { SettingKey } from '../value-objects';
import type { Addressed, SettingMap } from './setting.entity';
import { Setting } from './setting.entity';

interface Leaf {
  readonly isItem: boolean;
  readonly keyPath: readonly string[];
  readonly value: Setting;
}

// Why: cyrb53, a 53-bit hash: a lock names each leaf by it, so the hash never changes once
// released.
const SEED_LEFT = 0xde_ad_be_ef;
const SEED_RIGHT = 0x41_c6_ce_57;
const MIX_LEFT = 2_654_435_761;
const MIX_RIGHT = 1_597_334_677;
const FOLD_LEFT = 2_246_822_507;
const FOLD_RIGHT = 3_266_489_909;
const SHIFT_LEFT = 16;
const SHIFT_RIGHT = 13;
const HIGH_BITS = 0x1f_ff_ff;
const LOW_RANGE = 0x1_00_00_00_00;
const RADIX = 36;

const hashOf = (text: string): string => {
  let left = SEED_LEFT;
  let right = SEED_RIGHT;

  for (let at = 0; at < text.length; at += 1) {
    const code = text.charCodeAt(at);

    left = Math.imul(left ^ code, MIX_LEFT);
    right = Math.imul(right ^ code, MIX_RIGHT);
  }

  left = Math.imul(left ^ (left >>> SHIFT_LEFT), FOLD_LEFT);
  left ^= Math.imul(right ^ (right >>> SHIFT_RIGHT), FOLD_RIGHT);
  right = Math.imul(right ^ (right >>> SHIFT_LEFT), FOLD_LEFT);
  right ^= Math.imul(left ^ (left >>> SHIFT_RIGHT), FOLD_RIGHT);

  return (LOW_RANGE * (HIGH_BITS & right) + (left >>> 0)).toString(RADIX);
};

const keyOf = (leaf: Leaf): string =>
  hashOf(
    Setting.canonicalTextOf([
      [
        ...leaf.keyPath,
      ],
      leaf.value,
      leaf.isItem,
    ]),
  );

const scalarLeaf = (keyPath: readonly string[], setting: Setting): Leaf => ({
  isItem: false,
  keyPath,
  value: setting,
});

const itemLeaves = (keyPath: readonly string[], list: readonly Setting[]): readonly Leaf[] =>
  list.map((listed) => ({
    isItem: true,
    keyPath,
    value: listed,
  }));

const leavesOf = (setting: Setting, keyPath: readonly string[] = []): readonly Leaf[] => {
  if (Setting.isList(setting)) {
    return itemLeaves(keyPath, setting);
  }

  if (!Setting.isMap(setting)) {
    return [
      scalarLeaf(keyPath, setting),
    ];
  }

  return Object.entries(setting).flatMap(([key, held]) => {
    const address = SettingKey.addressOf(key);
    const at = [
      ...keyPath,
      key,
    ];

    return [
      ...(address === undefined
        ? []
        : [
            scalarLeaf(
              [
                ...at,
                address.field,
              ],
              address.value,
            ),
          ]),
      ...leavesOf(held, at),
    ];
  });
};

const elementLeaves = (input: {
  element: SettingMap;
  fields: readonly string[];
  key: string;
  keyPath: readonly string[];
}): readonly Leaf[] =>
  input.fields.flatMap((field) => {
    const named = input.element[field];

    if (typeof named !== 'string') {
      return [];
    }

    const at = [
      ...input.keyPath,
      SettingKey.addressText({
        field,
        list: input.key,
        value: named,
      }),
    ];
    const rest = Object.fromEntries(Object.entries(input.element).filter(([key]) => key !== field));

    return [
      scalarLeaf(
        [
          ...at,
          field,
        ],
        named,
      ),
      ...fileLeavesOf(rest, input.fields, at),
    ];
  });

const fileLeavesOf = (
  setting: Setting,
  fields: readonly string[],
  keyPath: readonly string[] = [],
): readonly Leaf[] => {
  if (!Setting.isMap(setting)) {
    return leavesOf(setting, keyPath);
  }

  return Object.entries(setting).flatMap(([key, held]) => {
    const at = [
      ...keyPath,
      key,
    ];

    return Setting.isList(held)
      ? [
          ...itemLeaves(at, held),
          ...held.filter(Setting.isMap).flatMap((element) =>
            elementLeaves({
              element,
              fields,
              key,
              keyPath,
            }),
          ),
        ]
      : fileLeavesOf(held, fields, at);
  });
};

const isHeldBy = (setting: Setting | undefined, leaf: Leaf): boolean => {
  const held = Setting.at(setting, leaf.keyPath);

  return leaf.isItem
    ? Setting.isList(held) && held.some((listed) => Setting.same(listed, leaf.value))
    : Setting.same(held, leaf.value);
};

const addressFieldsOf = (setting: Setting): ReadonlySet<string> =>
  new Set(
    Setting.isMap(setting)
      ? Object.entries(setting).flatMap(([key, held]) => {
          const address = SettingKey.addressOf(key);

          return [
            ...(address === undefined
              ? []
              : [
                  address.field,
                ]),
            ...addressFieldsOf(held),
          ];
        })
      : [],
  );

interface Removal {
  readonly isRemoved: boolean;
  readonly rest: Setting | undefined;
}

// Stryker disable next-line ObjectLiteral: an empty removal reads as one that removed nothing and left nothing
const kept: Removal = {
  isRemoved: false,
  rest: undefined,
};

const removedTo = (rest: Setting | undefined): Removal => ({
  isRemoved: true,
  rest: typeof rest === 'object' && Object.keys(rest).length === 0 ? undefined : rest,
});

const withoutKey = (map: SettingMap, key: string): SettingMap =>
  Object.fromEntries(Object.entries(map).filter(([held]) => held !== key));

const removedAtEnd = (node: Setting, leaf: Leaf): Removal => {
  if (!leaf.isItem) {
    return Setting.same(node, leaf.value) ? removedTo(undefined) : kept;
  }

  if (!Setting.isList(node)) {
    return kept;
  }

  const at = node.findIndex((listed) => Setting.same(listed, leaf.value));

  return at < 0 ? kept : removedTo(node.toSpliced(at, 1));
};

const elementUnlessOnlyItsAddressIsLeft = (
  rest: Setting | undefined,
  address: AddressKey,
): Setting | undefined =>
  Setting.isMap(rest) && Object.keys(rest).some((key) => key !== address.field) ? rest : undefined;

const withElement = (input: {
  address: AddressKey;
  found: Addressed;
  node: SettingMap;
  rest: Setting | undefined;
}): SettingMap => {
  const { address, found, rest } = input;
  const list =
    rest === undefined
      ? found.list.filter((listed) => listed !== found.element)
      : found.list.map((listed) => (listed === found.element ? rest : listed));

  return list.length === 0
    ? withoutKey(input.node, address.list)
    : {
        ...input.node,
        [address.list]: list,
      };
};

const removedIn = (node: Setting, keys: readonly string[], leaf: Leaf): Removal => {
  const [key, ...rest] = keys;

  if (key === undefined) {
    return removedAtEnd(node, leaf);
  }

  if (!Setting.isMap(node)) {
    return kept;
  }

  const address = SettingKey.addressOf(key);

  if (address === undefined) {
    const child = node[key];
    // Stryker disable next-line ConditionalExpression: below an absent key the walk finds nothing either
    const removal = child === undefined ? kept : removedIn(child, rest, leaf);

    return removal.isRemoved
      ? removedTo(
          removal.rest === undefined
            ? withoutKey(node, key)
            : {
                ...node,
                [key]: removal.rest,
              },
        )
      : kept;
  }

  const found = Setting.addressedIn(node, address);

  if (found === undefined) {
    return kept;
  }

  const removal =
    !leaf.isItem && rest.length === 1 && rest[0] === address.field
      ? {
          isRemoved: elementUnlessOnlyItsAddressIsLeft(found.element, address) === undefined,
          rest: undefined,
        }
      : removedIn(found.element, rest, leaf);

  return removal.isRemoved
    ? removedTo(
        withElement({
          address,
          found,
          node,
          rest: elementUnlessOnlyItsAddressIsLeft(removal.rest, address),
        }),
      )
    : kept;
};

const removedFrom = (setting: Setting, leaf: Leaf): Setting | undefined => {
  const removal = removedIn(setting, leaf.keyPath, leaf);

  if (!removal.isRemoved) {
    return undefined;
  }

  return removal.rest ?? (Setting.isList(setting) ? [] : {});
};

const textOf = (leaf: Leaf): string => {
  const keys = Setting.pathTextOf(leaf.keyPath);

  return leaf.isItem
    ? [
        keys,
        Setting.canonicalTextOf(leaf.value),
      ]
        .filter((part) => part !== '')
        .join(' ')
    : keys;
};

const Leaf = {
  addressFieldsOf,
  fileLeavesOf,
  isHeldBy,
  keyOf,
  leavesOf,
  removedFrom,
  textOf,
} as const;

export { Leaf };
