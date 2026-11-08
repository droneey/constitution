import { AXES, AXIS_FOLDER_NAME, Axis, Layer, Level } from '#/kernel/constants';
import { BlockId, BlockSource, Glob, PackPath, RuleSlug } from '#/kernel/value-objects';

import type { BlockSetBlock, BlockSetRule } from '../domain/block-set/entities';

const RULE_STATEMENT = 'A rule.';
const RULE_WHY = 'a reason.';

const axisOf = (place: string): Axis => {
  const axis = AXES.find((candidate) => place.startsWith(`${AXIS_FOLDER_NAME[candidate]}/`));

  if (axis === undefined) {
    throw new Error(`${place} names no axis`);
  }

  return axis;
};

interface BlockSetBlockFixture {
  readonly chapters?: readonly string[];
  readonly governs?: readonly string[];
  readonly id: string;
  readonly languages?: readonly string[];
  readonly layer?: Layer;
  readonly requires?: readonly string[];
  readonly seams?: readonly string[];
  readonly source?: string;
}

const blockSetBlockOf = (block: BlockSetBlockFixture): BlockSetBlock => ({
  chapters: (block.chapters ?? []).map((chapter) => ({
    axis: axisOf(chapter),
    name: chapter.slice(chapter.indexOf('/') + 1, -'.md'.length),
  })),
  governs: (block.governs ?? []).map(Glob.create),
  id: BlockId.create(block.id),
  languages: (block.languages ?? []).map(BlockId.create),
  layer: block.layer ?? Layer.Domain,
  requires: (block.requires ?? []).map(BlockId.create),
  seams: (block.seams ?? []).map((seam) => ({
    axis: axisOf(seam),
    other: BlockId.create(seam.slice(seam.indexOf('/') + 1)),
  })),
  source: BlockSource.create(
    block.source === undefined ? undefined : PackPath.create(block.source),
  ),
});

interface BlockSetRuleFixture {
  readonly axis?: Axis;
  readonly block: string;
  readonly isLevelStated?: boolean;
  readonly level?: Level;
  readonly seam?: string;
  readonly slug: string;
  readonly tightens?: string;
}

const blockSetRuleOf = (rule: BlockSetRuleFixture): BlockSetRule => ({
  axis: rule.axis ?? Axis.Foundation,
  block: BlockId.create(rule.block),
  isLevelStated: rule.isLevelStated ?? true,
  level: rule.level ?? Level.Must,
  ...(rule.seam === undefined
    ? {}
    : {
        seam: BlockId.create(rule.seam),
      }),
  slug: RuleSlug.create(rule.slug),
  statement: RULE_STATEMENT,
  ...(rule.tightens === undefined
    ? {}
    : {
        tightens: RuleSlug.create(rule.tightens),
      }),
  why: RULE_WHY,
});

export type { BlockSetBlockFixture, BlockSetRuleFixture };
export { blockSetBlockOf, blockSetRuleOf, RULE_STATEMENT, RULE_WHY };
