import type { Axis } from '#/kernel/constants';
import type { ModelRule, ProjectUnit } from '#/kernel/entities';
import type { BlockId, RuleSlug } from '#/kernel/value-objects';

import { EVERY } from '../constants';
import type { PresetEntry } from './preset-entry.entity';

/** What a unit follows, against which an entry's keys and preset file are taken or left. */
interface InForce {
  readonly axes: ReadonlySet<Axis>;
  readonly blocks: ReadonlySet<BlockId>;
  readonly languages: ReadonlySet<BlockId>;
  readonly lowered: ReadonlySet<RuleSlug>;
}

const ofUnit = (unit: ProjectUnit): InForce => ({
  axes: new Set(unit.axes),
  blocks: unit.blocks,
  languages: unit.languages,
  lowered: unit.loweredRules,
});

// A reader only the repository's unit follows is served by its file alone, over the blocks,
// languages and axes of every unit (ADR-0218); the rules it lowers are the repository's own.
const ofUnits = (input: {
  lowered: ReadonlySet<RuleSlug>;
  units: readonly ProjectUnit[];
}): InForce => ({
  axes: new Set(input.units.flatMap((unit) => unit.axes)),
  blocks: new Set(
    input.units.flatMap((unit) => [
      ...unit.blocks,
    ]),
  ),
  languages: new Set(
    input.units.flatMap((unit) => [
      ...unit.languages,
    ]),
  ),
  lowered: input.lowered,
});

const isRuleInForce = (
  inForce: InForce,
  input: {
    entry: PresetEntry;
    rules: ReadonlyMap<RuleSlug, ModelRule>;
  },
): boolean => {
  if (input.entry.rule === EVERY) {
    return true;
  }

  const rule = input.rules.get(input.entry.rule);

  return (
    rule !== undefined &&
    (rule.seam === undefined || inForce.blocks.has(rule.seam)) &&
    !inForce.lowered.has(rule.slug)
  );
};

const takes = (
  inForce: InForce,
  input: {
    entry: PresetEntry;
    rules: ReadonlyMap<RuleSlug, ModelRule>;
  },
): boolean => {
  const { entry } = input;
  const { placeInPresets } = entry.set;

  return (
    inForce.blocks.has(placeInPresets.reader) &&
    inForce.axes.has(placeInPresets.axis) &&
    placeInPresets.withs.every((block) => inForce.blocks.has(block)) &&
    inForce.blocks.has(entry.block) &&
    (entry.language === EVERY || inForce.languages.has(entry.language)) &&
    isRuleInForce(inForce, input)
  );
};

const InForce = {
  ofUnit,
  ofUnits,
  takes,
} as const;

export { InForce };
