import { Level, PATH_SEPARATOR } from '#/kernel/constants';
import type { ActiveBlock, CoreFiles, MustRule, SourcedFile } from '#/kernel/entities';
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

const mustRulesBesideCoreOf = (input: ActivateBlocksInput): readonly MustRule[] =>
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

const pathInSourceOf = (block: BlockSetBlock, file: BlockPart): string => {
  const pathInBlocks = BlockFilePlace.pathOf({
    block: block.id,
    file,
    layer: block.layer,
  });

  switch (block.source.kind) {
    case SourceKind.Release:
      return pathInBlocks;
    case SourceKind.Pack:
      return `${block.source.pack}${PATH_SEPARATOR}${pathInBlocks}`;
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return block.source satisfies never;
  }
};

const sourcedFileOf = (block: BlockSetBlock, file: BlockPart): SourcedFile => ({
  path: pathInSourceOf(block, file),
  source: block.source.kind,
});

const passportOf = (block: BlockSetBlock): SourcedFile =>
  sourcedFileOf(block, {
    kind: BlockFileKind.Passport,
  });

const partFilesOf = (input: {
  block: BlockSetBlock;
  unit: ResolvedUnit;
}): readonly SourcedFile[] => {
  const { block, unit } = input;

  return [
    ...block.chapters
      .filter((chapter) => ResolvedUnit.isAxisOn(unit, chapter.axis))
      .map((chapter) =>
        sourcedFileOf(block, {
          ...chapter,
          kind: BlockFileKind.Chapter,
        }),
      ),
    ...block.seams
      .filter(
        (seam) => ResolvedUnit.isAxisOn(unit, seam.axis) && ResolvedUnit.isActive(unit, seam.other),
      )
      .map((seam) =>
        sourcedFileOf(block, {
          ...seam,
          kind: BlockFileKind.Seam,
        }),
      ),
  ];
};

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
      files: [
        passportOf(block),
        ...partFilesOf({
          block,
          unit,
        }),
      ],
      governs: [
        ...new Set(
          reach.filter(({ reached }) => reached.has(block.id)).flatMap(({ from }) => from.governs),
        ),
      ],
      id: block.id,
      unit: unit.path,
    }));
  });

const coreFilesOf = (input: ActivateBlocksInput): readonly CoreFiles[] => {
  const core = input.model.blocks.find((block) => BlockId.equals(block.id, coreBlockId));

  return core === undefined
    ? []
    : input.units.flatMap((unit) => {
        const files = partFilesOf({
          block: core,
          unit,
        });

        return files.length === 0
          ? []
          : [
              {
                files,
                unit: unit.path,
              },
            ];
      });
};

interface BlocksActivated {
  readonly active: readonly ActiveBlock[];
  readonly core: readonly CoreFiles[];
  readonly mustsBesideCore: readonly MustRule[];
}

const activateBlocks = (input: ActivateBlocksInput): BlocksActivated => ({
  active: activeBlocksOf(input),
  core: coreFilesOf(input),
  mustsBesideCore: mustRulesBesideCoreOf(input),
});

export { activateBlocks };
