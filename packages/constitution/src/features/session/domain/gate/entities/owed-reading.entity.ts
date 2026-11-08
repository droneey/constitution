import { compareText, firstBy } from '#/kernel/utils';

import type { RuleHash } from '../value-objects';
import { GatedDefinition } from './gated-definition.entity';
import type { RuleRead, RulesRead } from './gated-rule.entity';
import { GatedRule } from './gated-rule.entity';

interface OwedReading {
  readonly definitions: readonly GatedDefinition[];
  readonly rules: readonly GatedRule[];
}

interface MarkedReading {
  readonly definitions: readonly RuleHash[];
  readonly rules: readonly RuleRead[];
}

interface ReadingCount {
  readonly definitions: number;
  readonly rules: number;
}

const unreadOf = (owed: OwedReading, read: RulesRead): OwedReading => ({
  definitions: owed.definitions.filter((definition) => !GatedDefinition.isRead(definition, read)),
  rules: owed.rules.filter((rule) => !GatedRule.isRead(rule, read)),
});

const countOf = (owed: OwedReading): ReadingCount => ({
  definitions: owed.definitions.length,
  rules: owed.rules.length,
});

const isEmpty = (owed: OwedReading): boolean =>
  owed.definitions.length === 0 && owed.rules.length === 0;

const joinedOf = (readings: readonly OwedReading[]): OwedReading => ({
  definitions: [
    ...firstBy(
      readings.flatMap((reading) => reading.definitions),
      GatedDefinition.keyOf,
    ).values(),
  ],
  rules: [
    ...firstBy(
      readings.flatMap((reading) => reading.rules),
      GatedRule.keyOf,
    ).values(),
  ],
});

const hashedTextOf = (owed: OwedReading): string =>
  [
    ...owed.rules.map(GatedRule.keyOf),
    ...owed.definitions.map(GatedDefinition.keyOf),
  ]
    .toSorted(compareText)
    .join('\n');

const OwedReading = {
  countOf,
  hashedTextOf,
  isEmpty,
  joinedOf,
  unreadOf,
} as const;

export type { MarkedReading, ReadingCount };
export { OwedReading };
