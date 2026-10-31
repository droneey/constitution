import type { RefusalKey } from '../value-objects';

enum GateEntryKind {
  Refused = 'refused',
  Passed = 'passed',
  Told = 'told',
  Reset = 'reset',
}

type GateEntry =
  | {
      readonly key: RefusalKey;
      readonly kind: GateEntryKind.Passed | GateEntryKind.Refused;
    }
  | {
      readonly kind: GateEntryKind.Reset | GateEntryKind.Told;
    };

const REFUSALS_BEFORE_PASS = 3;

const isRefusalOf = (entry: GateEntry, key: RefusalKey): boolean =>
  entry.kind === GateEntryKind.Refused && entry.key === key;

const isPassedAfter = (entries: readonly GateEntry[], key: RefusalKey): boolean => {
  const last = entries.findLastIndex((entry) => !isRefusalOf(entry, key));

  return entries.length - 1 - last >= REFUSALS_BEFORE_PASS;
};

const afterLast = (entries: readonly GateEntry[], kind: GateEntryKind): readonly GateEntry[] =>
  entries.slice(entries.findLastIndex((entry) => entry.kind === kind) + 1);

const untoldPassesOf = (entries: readonly GateEntry[]): number =>
  afterLast(entries, GateEntryKind.Told).filter((entry) => entry.kind === GateEntryKind.Passed)
    .length;

const GateEntry = {
  isPassedAfter,
  untoldPassesOf,
} as const;

export { GateEntry, GateEntryKind };
