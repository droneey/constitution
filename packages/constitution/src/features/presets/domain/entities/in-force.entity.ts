import type { Axis } from '#/kernel/constants';
import { AXES } from '#/kernel/constants';
import type { ModelRule, ProjectUnit } from '#/kernel/entities';
import type { BlockId, RuleSlug } from '#/kernel/value-objects';

import { EVERY } from '../constants';
import type { PresetEntry } from './preset-entry.entity';

interface EntryAsked {
  readonly entry: PresetEntry;
  readonly rules: ReadonlyMap<RuleSlug, ModelRule>;
}

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

const isRuleInForce = (inForce: InForce, input: EntryAsked): boolean => {
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

const takes = (inForce: InForce, input: EntryAsked): boolean => {
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

const isDroppedByOverrideOrAxis = (inForce: InForce, input: EntryAsked): boolean =>
  !takes(inForce, input) &&
  takes(
    {
      ...inForce,
      axes: new Set(AXES),
      lowered: new Set(),
    },
    input,
  );

const InForce = {
  isDroppedByOverrideOrAxis,
  ofUnit,
  ofUnits,
  takes,
} as const;

export type { EntryAsked };
export { InForce };
