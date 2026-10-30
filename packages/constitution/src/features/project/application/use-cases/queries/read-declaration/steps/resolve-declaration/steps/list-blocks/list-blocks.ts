import { AXES, Layer } from '#/kernel/constants';

import type {
  AppliedOverrides,
  BlockSetBlock,
  ListedBlock,
  ListedFiles,
  ProjectModel,
  ResolvedUnits,
  UnitEntry,
  UnitListing,
} from '../../../../../../../../domain/entities';
import { BlockListing, ResolvedUnit, UnitEntryKind } from '../../../../../../../../domain/entities';

interface ListInput {
  readonly block: BlockSetBlock;
  readonly repository: ResolvedUnit;
  readonly unit: ResolvedUnit;
}

const filesOf = (
  input: ListInput & {
    isOnlyAdded: boolean;
  },
): readonly ListedFiles[] => {
  const { block, isOnlyAdded, repository, unit } = input;

  return AXES.filter((axis) => ResolvedUnit.isAxisOn(unit, axis)).flatMap((axis) => {
    const isRepositoryAxis = ResolvedUnit.isAxisOn(repository, axis);
    const chapters = block.chapters
      .filter((chapter) => chapter.axis === axis && !(isOnlyAdded && isRepositoryAxis))
      .map((chapter) => chapter.name);
    const seams = block.seams
      .filter(
        (seam) =>
          seam.axis === axis &&
          ResolvedUnit.isActive(unit, seam.other) &&
          !(isOnlyAdded && ResolvedUnit.isActive(repository, seam.other) && isRepositoryAxis),
      )
      .map((seam) => seam.other);

    return chapters.length + seams.length === 0
      ? []
      : [
          {
            axis,
            chapters,
            seams,
          },
        ];
  });
};

const listedOf = (input: ListInput): ListedBlock => ({
  files: filesOf({
    ...input,
    isOnlyAdded: false,
  }),
  id: input.block.id,
  layer: input.block.layer,
  source: input.block.source,
  ...(input.block.summary === undefined
    ? {}
    : {
        summary: input.block.summary,
      }),
});

const repositoryBlocksOf = (input: {
  model: ProjectModel;
  repository: ResolvedUnit;
}): readonly ListedBlock[] =>
  input.model.blocks
    .filter(
      (block) => block.layer !== Layer.Core && ResolvedUnit.isActive(input.repository, block.id),
    )
    .map((block) =>
      listedOf({
        block,
        repository: input.repository,
        unit: input.repository,
      }),
    );

const entryOf = (input: ListInput): UnitEntry | undefined => {
  if (!ResolvedUnit.isActive(input.repository, input.block.id)) {
    return {
      block: listedOf(input),
      kind: UnitEntryKind.Own,
    };
  }

  const files = filesOf({
    ...input,
    isOnlyAdded: true,
  });

  return files.length === 0
    ? undefined
    : {
        files,
        id: input.block.id,
        kind: UnitEntryKind.Added,
        layer: input.block.layer,
      };
};

const unitListingOf = (input: {
  model: ProjectModel;
  repository: ResolvedUnit;
  unit: ResolvedUnit;
}): UnitListing => {
  const { model, repository, unit } = input;

  return {
    entries: model.blocks.flatMap((block) => {
      const entry =
        block.layer === Layer.Core || !ResolvedUnit.isActive(unit, block.id)
          ? undefined
          : entryOf({
              block,
              repository,
              unit,
            });

      return entry === undefined
        ? []
        : [
            entry,
          ];
    }),
    leftOutAxes: AXES.filter(
      (axis) => ResolvedUnit.isAxisOn(repository, axis) && !ResolvedUnit.isAxisOn(unit, axis),
    ),
    leftOutBlocks: model.blocks
      .filter(
        (block) =>
          ResolvedUnit.isActive(repository, block.id) && !ResolvedUnit.isActive(unit, block.id),
      )
      .map((block) => block.id),
    unit: unit.path,
  };
};

interface ListBlocksInput {
  readonly applied: AppliedOverrides;
  readonly model: ProjectModel;
  readonly units: ResolvedUnits;
}

const listBlocks = (input: ListBlocksInput): BlockListing => {
  const [repository, ...members] = input.units;

  return BlockListing.create({
    overrides: input.applied.live,
    repository: repositoryBlocksOf({
      model: input.model,
      repository,
    }),
    units: members.map((unit) =>
      unitListingOf({
        model: input.model,
        repository,
        unit,
      }),
    ),
  });
};

export { listBlocks };
