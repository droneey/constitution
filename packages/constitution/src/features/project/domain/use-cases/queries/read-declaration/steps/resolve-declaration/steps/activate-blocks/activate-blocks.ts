import { Level, PATH_SEPARATOR } from '#/kernel/constants';
import type { ActiveBlock, MustRule } from '#/kernel/entities';
import type { BlockPart } from '#/kernel/value-objects';
import {
  BlockFileKind,
  BlockFilePlace,
  BlockId,
  coreBlockId,
  SourceKind,
} from '#/kernel/value-objects';

import type { AppliedOverrides, BlockSetBlock, BlockSetRule } from '../../../../../../../entities';
import { ProjectModel, ResolvedUnit } from '../../../../../../../entities';

interface ActivateBlocksInput {
  readonly applied: AppliedOverrides;
  readonly model: ProjectModel;
  readonly rules: readonly BlockSetRule[];
  readonly units: readonly ResolvedUnit[];
}

const mustRulesOf = (input: ActivateBlocksInput): readonly MustRule[] =>
  input.rules.flatMap((rule) => {
    const isActive = input.units.some((unit) => ResolvedUnit.isActiveRule(unit, rule));

    if (rule.level !== Level.Must || BlockId.equals(rule.block, coreBlockId) || !isActive) {
      return [];
    }

    return [
      {
        block: rule.block,
        lowerings: input.applied.lowerings.get(rule.slug) ?? [],
        slug: rule.slug,
      },
    ];
  });

// What a block needs in a unit: what it requires, its bases, and the blocks its seams name on the
// axes the unit follows.
const neededOf = (input: {
  block: BlockSetBlock;
  model: ProjectModel;
  unit: ResolvedUnit;
}): readonly BlockId[] => [
  ...input.block.requires,
  ...ProjectModel.basesOf(input.model, input.block.id),
  ...input.block.seams
    .filter((seam) => ResolvedUnit.isAxisOn(input.unit, seam.axis))
    .map((seam) => seam.other),
];

// The block and every active block it needs, directly or through others; active holds the unit's
// active blocks, core aside.
const reachedFrom = (input: {
  active: ReadonlyMap<BlockId, BlockSetBlock>;
  from: BlockSetBlock;
  model: ProjectModel;
  unit: ResolvedUnit;
}): ReadonlySet<BlockId> => {
  const { active, model, unit } = input;
  const reached = new Set<BlockId>();
  const pending = [
    input.from,
  ];

  for (let block = pending.pop(); block !== undefined; block = pending.pop()) {
    if (!reached.has(block.id)) {
      reached.add(block.id);
      pending.push(
        ...neededOf({
          block,
          model,
          unit,
        }).flatMap((id) => active.get(id) ?? []),
      );
    }
  }

  return reached;
};

// The files of a block a unit reads: its passport, its chapters on the axes the unit follows, and
// its seams with the blocks active there; a pack's from the pack's folder.
const filesOf = (input: { block: BlockSetBlock; unit: ResolvedUnit }): readonly string[] => {
  const { block, unit } = input;
  const source =
    block.source.kind === SourceKind.Pack ? `${block.source.pack}${PATH_SEPARATOR}` : '';

  const pathOf = (file: BlockPart): string =>
    `${source}${BlockFilePlace.pathOf({
      block: block.id,
      file,
      layer: block.layer,
    })}`;

  return [
    pathOf({
      kind: BlockFileKind.Passport,
    }),
    ...block.chapters
      .filter((chapter) => ResolvedUnit.isAxisOn(unit, chapter.axis))
      .map((chapter) =>
        pathOf({
          ...chapter,
          kind: BlockFileKind.Chapter,
        }),
      ),
    ...block.seams
      .filter(
        (seam) => ResolvedUnit.isAxisOn(unit, seam.axis) && ResolvedUnit.isActive(unit, seam.other),
      )
      .map((seam) =>
        pathOf({
          ...seam,
          kind: BlockFileKind.Seam,
        }),
      ),
  ];
};

// A block also governs what every active block that needs it, directly or through others, governs.
const activeBlocksOf = (input: ActivateBlocksInput): readonly ActiveBlock[] =>
  input.units.flatMap((unit) => {
    const blocks = input.model.blocks.filter(
      (block) => !BlockId.equals(block.id, coreBlockId) && ResolvedUnit.isActive(unit, block.id),
    );
    const active = new Map(
      blocks.map((block) => [
        block.id,
        block,
      ]),
    );
    const reach = blocks.map((from) => ({
      from,
      reached: reachedFrom({
        active,
        from,
        model: input.model,
        unit,
      }),
    }));

    return blocks.map((block) => ({
      files: filesOf({
        block,
        unit,
      }),
      governs: [
        ...new Set(
          reach.filter(({ reached }) => reached.has(block.id)).flatMap(({ from }) => from.governs),
        ),
      ],
      id: block.id,
      unit: unit.path,
    }));
  });

interface BlocksActivated {
  readonly active: readonly ActiveBlock[];
  /** the MUST rules of the active blocks, core's aside */
  readonly musts: readonly MustRule[];
}

const activateBlocks = (input: ActivateBlocksInput): BlocksActivated => ({
  active: activeBlocksOf(input),
  musts: mustRulesOf(input),
});

export { activateBlocks };
