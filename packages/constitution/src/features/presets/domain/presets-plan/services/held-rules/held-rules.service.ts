import type { WholeHold, WholeHolds } from '#/kernel/entities';
import type { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { PresetEntry } from '../../../preset-entry/entities';
import { EVERY } from '../../../shared/constants';
import type { Candidate } from '../../entities';

interface WholeEntry {
  readonly language: BlockId | typeof EVERY;
  readonly rule: RuleSlug;
}

const wholeEntriesOf = (candidate: Candidate): readonly WholeEntry[] =>
  candidate.entries.flatMap((entry: PresetEntry) =>
    entry.isWhole && entry.rule !== EVERY
      ? [
          {
            language: entry.language,
            rule: entry.rule,
          },
        ]
      : [],
  );

const holdOf = (entries: readonly WholeEntry[]): WholeHold => ({
  isEveryLanguage: entries.some((entry) => entry.language === EVERY),
  languages: new Set(
    entries.flatMap((entry) =>
      entry.language === EVERY
        ? []
        : [
            entry.language,
          ],
    ),
  ),
});

const heldRulesOf = (candidates: readonly Candidate[]): WholeHolds =>
  new Map(
    [
      ...Map.groupBy(candidates, (candidate) => candidate.unit.path),
    ].map(([unit, held]) => [
      unit,
      new Map(
        [
          ...Map.groupBy(held.flatMap(wholeEntriesOf), (entry) => entry.rule),
        ].map(([rule, entries]) => [
          rule,
          holdOf(entries),
        ]),
      ),
    ]),
  );

export { heldRulesOf };
