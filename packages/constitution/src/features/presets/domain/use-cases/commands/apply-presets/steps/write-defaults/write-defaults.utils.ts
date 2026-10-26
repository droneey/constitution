import type { MergedFile } from '../../../../../entities';
import { Leaf, Setting } from '../../../../../entities';

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
  readonly setting: Setting;
}

/**
 * Of a whole file's default, each line or each key is a leaf; its text is none, written only while
 * the file is absent.
 */
const defaultLeavesOf = (input: DefaultLeavesInput): readonly Leaf[] => {
  const { whole } = input.merged;
  const atPaths = input.merged.defaults.map((setting) => ({
    isItem: false,
    path: setting.path,
    value: setting.value,
  }));

  if (Setting.isList(whole) && input.isLines) {
    return [
      ...atPaths,
      ...whole.map((line) => ({
        isItem: true,
        path: [],
        value: line,
      })),
    ];
  }

  return Setting.isMap(whole)
    ? [
        ...atPaths,
        ...Object.entries(whole).map(([key, held]) => ({
          isItem: false,
          path: [
            key,
          ],
          value: held,
        })),
      ]
    : atPaths;
};

// A line or a key the file lacks is added, a map the file holds takes the keys it lacks, and what
// the file holds stays; each default met is recorded, so one the user deletes stays deleted.
const withDefault = (input: { leaf: Leaf; met: Set<string>; setting: Setting }): Written => {
  const { leaf, met, setting } = input;
  const key = Leaf.keyOf(leaf);
  const held = Setting.at(setting, leaf.path);
  const isNew = !met.has(key);
  const kept: Written = {
    added: [],
    setting,
  };

  met.add(key);

  if (!isNew) {
    return kept;
  }

  if (leaf.isItem) {
    return Leaf.isHeldBy(setting, leaf) || !(held === undefined || Setting.isList(held))
      ? kept
      : {
          added: [
            leaf,
          ],
          setting: Setting.withAt({
            path: leaf.path,
            setting,
            value: [
              ...(Setting.isList(held) ? held : []),
              leaf.value,
            ],
          }),
        };
  }

  if (held === undefined) {
    return {
      added: [
        leaf,
      ],
      setting: Setting.withAt({
        path: leaf.path,
        setting,
        value: leaf.value,
      }),
    };
  }

  return Setting.isMap(held) && Setting.isMap(leaf.value)
    ? withDefaults({
        leaves: Object.entries(leaf.value).map(([child, given]) => ({
          isItem: false,
          path: [
            ...leaf.path,
            child,
          ],
          value: given,
        })),
        met,
        setting,
      })
    : kept;
};

const withDefaults = (input: {
  leaves: readonly Leaf[];
  met: Set<string>;
  setting: Setting;
}): Written => {
  const added: Leaf[] = [];
  let { setting } = input;

  for (const leaf of input.leaves) {
    const next = withDefault({
      leaf,
      met: input.met,
      setting,
    });

    added.push(...next.added);
    setting = next.setting;
  }

  return {
    added,
    setting,
  };
};

/** A default met before and deleted since stays out. */
const writeDefaults = (input: WriteDefaultsInput): DefaultsWritten => {
  const met = new Set(input.met);
  const written = withDefaults({
    leaves: input.leaves,
    met,
    setting: input.setting,
  });

  return {
    added: written.added,
    met: [
      ...met,
    ],
    setting: written.setting,
  };
};

export type { DefaultLeavesInput, DefaultsWritten, WriteDefaultsInput };
export { defaultLeavesOf, writeDefaults };
