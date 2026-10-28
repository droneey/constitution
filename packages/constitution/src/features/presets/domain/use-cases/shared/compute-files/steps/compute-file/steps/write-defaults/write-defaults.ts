import type { MergedFile } from '../../../../../../../entities';
import { Leaf, Setting, WholeKind } from '../../../../../../../entities';

interface DefaultLeavesInput {
  /** whether the file is one of lines, whose whole default adds each line it lacks */
  readonly isLines: boolean;
  readonly merged: MergedFile;
}

interface WriteDefaultsInput {
  readonly leaves: readonly Leaf[];
  /** the keys of the defaults the lock says were met before */
  readonly met: readonly string[];
  readonly setting: Setting;
}

interface DefaultsWritten {
  readonly added: readonly Leaf[];
  /** the keys of every default met, written or found present */
  readonly met: readonly string[];
  readonly setting: Setting;
}

interface Written {
  readonly added: readonly Leaf[];
  readonly met: ReadonlySet<string>;
  readonly setting: Setting;
}

// Of a whole file's default, each line of a file of lines or each key is a leaf; a text is none,
// written only while the file is absent.
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

/** The defaults the entries give at their paths, then those of the whole file. */
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

// A line or a key the file lacks is added, a map the file holds takes the keys it lacks, and what
// the file holds stays; each default met is recorded, so one the user deletes stays deleted.
const withDefault = (written: Written, leaf: Leaf): Written => {
  const key = Leaf.keyOf(leaf);

  if (written.met.has(key)) {
    return written;
  }

  const { setting } = written;
  const held = Setting.at(setting, leaf.keyPath);
  const kept: Written = {
    ...written,
    met: new Set([
      ...written.met,
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

/** A default met before and deleted since stays out. */
const writeDefaults = (input: WriteDefaultsInput): DefaultsWritten => {
  const written = input.leaves.reduce(withDefault, {
    added: [],
    met: new Set(input.met),
    setting: input.setting,
  });

  return {
    added: written.added,
    met: [
      ...written.met,
    ],
    setting: written.setting,
  };
};

export type { DefaultLeavesInput, DefaultsWritten, WriteDefaultsInput };
export { defaultLeavesOf, writeDefaults };
