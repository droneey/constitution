import type { Level } from '#/kernel/constants';
import type { ActiveBlock, CoreFiles, Lowering, SourcedFile, WholeHolds } from '#/kernel/entities';
import type { BlockId, RepositoryRelativePath, RuleSlug } from '#/kernel/value-objects';
import { AbsolutePath, SourceKind, UnitPath } from '#/kernel/value-objects';

import { ActiveBlocks } from '../../session/entities';
import { TargetKind } from './gate-target.entity';

const EVERY_FILE = '**';

interface ActiveRules {
  readonly active: readonly ActiveBlock[];
  readonly core: readonly CoreFiles[];
  readonly held: WholeHolds;
  readonly levels: ReadonlyMap<RuleSlug, Level>;
  readonly lowerings: ReadonlyMap<RuleSlug, readonly Lowering[]>;
  readonly releaseFolderPath: AbsolutePath;
  readonly repositoryFolderPath: AbsolutePath;
}

interface RuleTarget {
  readonly kind: TargetKind;
  readonly path: RepositoryRelativePath;
}

const sourceFolderPathOf = (rules: ActiveRules, source: SourceKind): AbsolutePath => {
  switch (source) {
    case SourceKind.Release:
      return rules.releaseFolderPath;
    case SourceKind.Pack:
      return rules.repositoryFolderPath;
  }
};

const blockFilePath = (rules: ActiveRules, file: SourcedFile): AbsolutePath =>
  AbsolutePath.join(sourceFolderPathOf(rules, file.source), file.path);

const governsEveryFile = (block: ActiveBlock): boolean =>
  block.governs.some((glob) => glob === EVERY_FILE);

const ruleFilesOf = (rules: ActiveRules, target: RuleTarget): readonly AbsolutePath[] => {
  const unit = ActiveBlocks.unitHolding(rules, target.path);
  const core = rules.core.find((held) => UnitPath.equals(held.unit, unit))?.files ?? [];
  const everywhere = rules.active.filter(
    (block) => UnitPath.equals(block.unit, unit) && governsEveryFile(block),
  );
  const matching =
    target.kind === TargetKind.File ? ActiveBlocks.governing(rules, target.path) : [];

  return [
    ...new Set(
      [
        ...core,
        ...[
          ...everywhere,
          ...matching,
        ].flatMap((block) => block.files),
      ].map((file) => blockFilePath(rules, file)),
    ),
  ];
};

const loweringOf = (
  rules: ActiveRules,
  input: {
    slug: RuleSlug;
    unit: UnitPath;
  },
): Lowering | undefined => {
  const here =
    rules.lowerings
      .get(input.slug)
      ?.filter((lowering) => UnitPath.equals(lowering.unit, input.unit)) ?? [];

  return here.find((lowering) => lowering.via === undefined) ?? here[0];
};

interface HeldAsked {
  readonly blocks: readonly BlockId[];
  readonly slug: RuleSlug;
  readonly unit: UnitPath;
}

// Why: a tool holds a rule whole only in the languages its setting names, so a rule is given as
// its heading alone only where the target's own language, or every language, is among them.
const isHeld = (rules: ActiveRules, input: HeldAsked): boolean => {
  const hold = rules.held.get(input.unit)?.get(input.slug);

  return (
    hold !== undefined &&
    (hold.isEveryLanguage || input.blocks.some((block) => hold.languages.has(block)))
  );
};

const governingBlocksOf = (rules: ActiveRules, target: RuleTarget): readonly BlockId[] =>
  target.kind === TargetKind.File
    ? ActiveBlocks.governing(rules, target.path).map((block) => block.id)
    : [];

const ActiveRules = {
  isHeld,
  governingBlocksOf,
  loweringOf,
  ruleFilesOf,
} as const;

export type { RuleTarget };
export { ActiveRules };
