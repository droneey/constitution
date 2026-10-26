import type { Contribution, LinesLayout, PresetEntry, Setting } from '../../../../../entities';
import { PresetEntry as Entries, Setting as Settings, ValueKind } from '../../../../../entities';

interface LayOutLinesInput {
  readonly contributions: readonly Contribution[];
  /** every entry the presets hold, whatever the unit's blocks */
  readonly entries: readonly PresetEntry[];
  readonly merged: Setting | undefined;
  readonly written: readonly PresetEntry[];
}

/**
 * The groups of a file of lines: each line under the name of the first entry that gives it, in the
 * merge's order, a default's lines aside; and every name an entry of the file's path gives.
 */
const layOutLines = (input: LayOutLinesInput): LinesLayout | undefined => {
  const { merged } = input;

  if (!Settings.isList(merged)) {
    return undefined;
  }

  const wanted = merged.map(String);
  const groups = new Map<string, string[]>();
  const placed = new Set<string>();

  for (const contribution of input.contributions) {
    const given = contribution.value;
    // Stryker disable ArrayDeclaration: a line no merged list holds is passed by
    const lines =
      given.kind === ValueKind.Plain || given.kind === ValueKind.Replace
        ? (Settings.isList(given.setting) ? given.setting : []).map(String)
        : [];
    // Stryker restore ArrayDeclaration

    for (const line of lines.filter((listed) => wanted.includes(listed) && !placed.has(listed))) {
      placed.add(line);
      groups.set(contribution.group, [
        ...(groups.get(contribution.group) ?? []),
        line,
      ]);
    }
  }

  const paths = new Set(input.written.map((entry) => entry.file.path));

  return {
    groups: [
      ...groups,
    ].map(([name, lines]) => ({
      lines,
      name,
    })),
    names: [
      ...new Set(input.entries.filter((entry) => paths.has(entry.file.path)).map(Entries.groupOf)),
    ],
  };
};

export type { LayOutLinesInput };
export { layOutLines };
