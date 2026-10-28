import type { SettingMap } from '../../../../../../../entities';
import { Leaf, Setting } from '../../../../../../../entities';
import { SettingKey } from '../../../../../../../value-objects';

/** A setting of ours the file holds otherwise, kept as the file has it. */
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
  /** the keys of the leaves the lock says are ours from before */
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

// Our items first, each found in the file where it holds it, then the file's own.
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

// Maps merge deeply, key by key; then each element we address is found by its field or made, and
// the elements we address lead their list.
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

/**
 * A path of ours the file holds otherwise is the user's loosening, kept and reported, unless the
 * lock says the value there is ours from before.
 */
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
