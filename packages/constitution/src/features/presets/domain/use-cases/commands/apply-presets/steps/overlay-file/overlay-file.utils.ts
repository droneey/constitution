import type { SettingMap } from '../../../../../entities';
import { Leaf, Setting } from '../../../../../entities';
import { SettingKey } from '../../../../../value-objects';

/** A setting of ours the file holds otherwise, kept as the file has it. */
interface Loosening {
  readonly path: readonly string[];
  readonly wanted: Setting;
}

interface Overlaid {
  readonly loosenings: readonly Loosening[];
  readonly value: Setting;
}

interface OverlayInput {
  readonly file: Setting | undefined;
  /** the keys of the leaves the lock says are ours from before */
  readonly locked: ReadonlySet<string>;
  readonly ours: Setting;
  readonly path: readonly string[];
}

const loosened = (
  input: OverlayInput & {
    file: Setting;
  },
): Overlaid => ({
  loosenings: [
    {
      path: input.path,
      wanted: input.ours,
    },
  ],
  value: input.file,
});

// Our items first, each found in the file where it holds it, then the file's own.
const overlayList = (
  input: OverlayInput & {
    ours: readonly Setting[];
  },
): Overlaid => {
  if (input.file !== undefined && !Setting.isList(input.file)) {
    return loosened({
      ...input,
      file: input.file,
    });
  }

  const rest = input.ours.reduce<readonly Setting[]>((left, listed) => {
    const at = left.findIndex((known) => Setting.same(known, listed));

    return at < 0 ? left : left.toSpliced(at, 1);
  }, input.file ?? []);

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
  if (input.file !== undefined && !Setting.isMap(input.file)) {
    return loosened({
      ...input,
      file: input.file,
    });
  }

  const base = input.file ?? {};
  const pairs = Object.entries(input.ours);
  const atKeys = pairs
    .filter(([key]) => SettingKey.addressOf(key) === undefined)
    .map(([key, held]) => ({
      key,
      overlaid: overlay({
        ...input,
        file: base[key],
        ours: held,
        path: [
          ...input.path,
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
            overlaid: overlay({
              ...input,
              file: found?.element ?? {
                [address.field]: address.value,
              },
              ours: held,
              path: [
                ...input.path,
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
          // Stryker disable ArrayDeclaration: no text added here shares an identity with the file's items
          const originals: readonly Setting[] = addressed.flatMap(({ found }) =>
            found === undefined
              ? []
              : [
                  found.element,
                ],
          );
          // Stryker restore ArrayDeclaration

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
const overlay = (input: OverlayInput): Overlaid => {
  const { file, ours } = input;

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
    file === undefined ||
    Setting.same(file, ours) ||
    input.locked.has(
      Leaf.keyOf({
        isItem: false,
        path: input.path,
        value: file,
      }),
    );

  return isOurs
    ? {
        loosenings: [],
        value: ours,
      }
    : loosened({
        ...input,
        file,
      });
};

export type { Loosening, Overlaid, OverlayInput };
export { overlay };
