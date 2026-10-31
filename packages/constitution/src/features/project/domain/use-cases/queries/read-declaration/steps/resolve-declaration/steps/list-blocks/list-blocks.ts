import { AXES, Layer } from '#/kernel/constants';

import type {
  BlockListing,
  ListedBlock,
  ProjectModel,
  ResolvedUnits,
  UnitListing,
} from '../../../../../../../entities';
import { ResolvedUnit } from '../../../../../../../entities';

const repositoryBlocksOf = (input: {
  model: ProjectModel;
  repository: ResolvedUnit;
}): readonly ListedBlock[] =>
  input.model.blocks
    .filter(
      (block) => block.layer !== Layer.Core && ResolvedUnit.isActive(input.repository, block.id),
    )
    .map((block) => ({
      id: block.id,
      layer: block.layer,
      source: block.source,
    }));

const unitListingOf = (input: {
  model: ProjectModel;
  repository: ResolvedUnit;
  unit: ResolvedUnit;
}): UnitListing => {
  const { model, repository, unit } = input;

  return {
    leftOutAxes: AXES.filter(
      (axis) => ResolvedUnit.isAxisOn(repository, axis) && !ResolvedUnit.isAxisOn(unit, axis),
    ),
    leftOutBlocks: model.blocks
      .filter(
        (block) =>
          ResolvedUnit.isActive(repository, block.id) && !ResolvedUnit.isActive(unit, block.id),
      )
      .map((block) => block.id),
    own: model.blocks
      .filter(
        (block) =>
          ResolvedUnit.isActive(unit, block.id) && !ResolvedUnit.isActive(repository, block.id),
      )
      .map((block) => ({
        id: block.id,
        source: block.source,
      })),
    unit: unit.path,
  };
};

interface ListBlocksInput {
  readonly model: ProjectModel;
  readonly units: ResolvedUnits;
}

const listBlocks = (input: ListBlocksInput): BlockListing => {
  const [repository, ...members] = input.units;

  return {
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
  };
};

export { listBlocks };
