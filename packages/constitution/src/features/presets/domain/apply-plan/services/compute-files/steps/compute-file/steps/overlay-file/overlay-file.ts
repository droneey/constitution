import type { SettingMap } from '../../../../../../../setting/entities';
import { Leaf, Setting } from '../../../../../../../setting/entities';
import { SettingKey } from '../../../../../../../shared/value-objects';

interface Loosening {
  readonly keyPath: readonly string[];
  readonly wanted: Setting;
}

interface Overlaid {
  readonly loosenings: readonly Loosening[];
  readonly value: Setting;
}

interface OverlayInput {
  readonly fileSetting: Setting | undefined;
  readonly keyPath: readonly string[];
  readonly locked: ReadonlySet<string>;
  readonly ours: Setting;
}

const loosened = (
  input: OverlayInput & {
    fileSetting: Setting;
  },
): Overlaid => ({
  loosenings: [
    {
      keyPath: input.keyPath,
      wanted: input.ours,
    },
  ],
  value: input.fileSetting,
});

const overlayList = (
  input: OverlayInput & {
    ours: readonly Setting[];
  },
): Overlaid => {
  if (input.fileSetting !== undefined && !Setting.isList(input.fileSetting)) {
    return loosened({
      ...input,
      fileSetting: input.fileSetting,
    });
  }

  const rest = input.ours.reduce<readonly Setting[]>((left, listed) => {
    const at = left.findIndex((known) => Setting.same(known, listed));

    return at < 0 ? left : left.toSpliced(at, 1);
  }, input.fileSetting ?? []);

  return {
    loosenings: [],
    value: [
      ...input.ours,
      ...rest,
    ],
  };
};

const overlayMap = (
  input: OverlayInput & {
    ours: SettingMap;
  },
): Overlaid => {
  if (input.fileSetting !== undefined && !Setting.isMap(input.fileSetting)) {
    return loosened({
      ...input,
      fileSetting: input.fileSetting,
    });
  }

  const base = input.fileSetting ?? {};
  const pairs = Object.entries(input.ours);
  const atKeys = pairs
    .filter(([key]) => SettingKey.addressOf(key) === undefined)
    .map(([key, held]) => ({
      key,
      overlaid: overlayFile({
        ...input,
        fileSetting: base[key],
        ours: held,
        keyPath: [
          ...input.keyPath,
          key,
        ],
      }),
    }));
  const keyed: SettingMap = {
    ...base,
    ...Object.fromEntries(
      atKeys.map(({ key, overlaid }) => [
        key,
        overlaid.value,
      ]),
    ),
  };
  const atAddresses = pairs.flatMap(([key, held]) => {
    const address = SettingKey.addressOf(key);
    const found = address === undefined ? undefined : Setting.addressedIn(keyed, address);

    return address === undefined
      ? []
      : [
          {
            address,
            found,
            overlaid: overlayFile({
              ...input,
              fileSetting: found?.element ?? {
                [address.field]: address.value,
              },
              ours: held,
              keyPath: [
                ...input.keyPath,
                key,
              ],
            }),
          },
        ];
  });
  const lists = Map.groupBy(atAddresses, (addressed) => addressed.address.list);

  return {
    loosenings: [
      ...atKeys,
      ...atAddresses,
    ].flatMap(({ overlaid }) => overlaid.loosenings),
    value: Object.fromEntries([
      ...Object.entries(keyed),
      ...[
        ...lists,
      ].map(
        ([list, addressed]): [
          string,
          Setting,
        ] => {
          const held = keyed[list];
          const originals: readonly (Setting | undefined)[] = addressed.map(
            ({ found }) => found?.element,
          );

          return [
            list,
            [
              ...addressed.map(({ overlaid }) => overlaid.value),
              ...(Setting.isList(held) ? held : []).filter((listed) => !originals.includes(listed)),
            ],
          ];
        },
      ),
    ]),
  };
};

const overlayFile = (input: OverlayInput): Overlaid => {
  const { fileSetting, ours } = input;

  if (Setting.isMap(ours)) {
    return overlayMap({
      ...input,
      ours,
    });
  }

  if (Setting.isList(ours)) {
    return overlayList({
      ...input,
      ours,
    });
  }

  const isOurs =
    fileSetting === undefined ||
    Setting.same(fileSetting, ours) ||
    input.locked.has(
      Leaf.keyOf({
        isItem: false,
        keyPath: input.keyPath,
        value: fileSetting,
      }),
    );

  return isOurs
    ? {
        loosenings: [],
        value: ours,
      }
    : loosened({
        ...input,
        fileSetting,
      });
};

export type { Loosening, Overlaid, OverlayInput };
export { overlayFile };
