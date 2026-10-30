import type { MergedFile } from '../../../../../../../../domain/entities';
import { Leaf, Setting, WholeKind } from '../../../../../../../../domain/entities';

interface DefaultLeavesInput {
  readonly isLines: boolean;
  readonly merged: MergedFile;
}

interface WriteDefaultsInput {
  readonly leaves: readonly Leaf[];
  readonly metBefore: readonly string[];
  readonly setting: Setting;
}

interface DefaultsWritten {
  readonly added: readonly Leaf[];
  readonly everMet: readonly string[];
  readonly setting: Setting;
}

interface Written {
  readonly added: readonly Leaf[];
  readonly everMet: ReadonlySet<string>;
  readonly setting: Setting;
}

const wholeLeavesOf = (input: DefaultLeavesInput): readonly Leaf[] => {
  const { whole } = input.merged;

  if (whole?.kind !== WholeKind.Added) {
    return [];
  }

  if (Setting.isList(whole.setting)) {
    return input.isLines
      ? whole.setting.map((line) => ({
          isItem: true,
          keyPath: [],
          value: line,
        }))
      : [];
  }

  return Object.entries(whole.setting).map(([key, held]) => ({
    isItem: false,
    keyPath: [
      key,
    ],
    value: held,
  }));
};

const defaultLeavesOf = (input: DefaultLeavesInput): readonly Leaf[] => [
  ...input.merged.defaults.map((setting) => ({
    isItem: false,
    keyPath: setting.keyPath,
    value: setting.value,
  })),
  ...wholeLeavesOf(input),
];

const withAdded = (input: { leaf: Leaf; value: Setting; written: Written }): Written => ({
  ...input.written,
  added: [
    ...input.written.added,
    input.leaf,
  ],
  setting: Setting.withAt({
    keyPath: input.leaf.keyPath,
    setting: input.written.setting,
    value: input.value,
  }),
});

// Why: a default met once is never written again, so one the user deleted stays deleted.
const withDefault = (written: Written, leaf: Leaf): Written => {
  const key = Leaf.keyOf(leaf);

  if (written.everMet.has(key)) {
    return written;
  }

  const { setting } = written;
  const held = Setting.at(setting, leaf.keyPath);
  const kept: Written = {
    ...written,
    everMet: new Set([
      ...written.everMet,
      key,
    ]),
  };

  if (leaf.isItem) {
    return Leaf.isHeldBy(setting, leaf) || !(held === undefined || Setting.isList(held))
      ? kept
      : withAdded({
          leaf,
          value: [
            ...(Setting.isList(held) ? held : []),
            leaf.value,
          ],
          written: kept,
        });
  }

  if (held === undefined) {
    return withAdded({
      leaf,
      value: leaf.value,
      written: kept,
    });
  }

  return Setting.isMap(held) && Setting.isMap(leaf.value)
    ? Object.entries(leaf.value)
        .map(([child, given]) => ({
          isItem: false,
          keyPath: [
            ...leaf.keyPath,
            child,
          ],
          value: given,
        }))
        .reduce(withDefault, kept)
    : kept;
};

const writeDefaults = (input: WriteDefaultsInput): DefaultsWritten => {
  const written = input.leaves.reduce(withDefault, {
    added: [],
    everMet: new Set(input.metBefore),
    setting: input.setting,
  });

  return {
    added: written.added,
    everMet: [
      ...written.everMet,
    ],
    setting: written.setting,
  };
};

export type { DefaultLeavesInput, DefaultsWritten, WriteDefaultsInput };
export { defaultLeavesOf, writeDefaults };
