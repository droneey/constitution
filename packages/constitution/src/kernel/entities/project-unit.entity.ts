import type { Axis } from '../constants';
import type { BlockId, RuleSlug } from '../value-objects';
import { UnitPath } from '../value-objects';

interface ProjectUnit {
  readonly axes: readonly Axis[];
  readonly blocks: ReadonlySet<BlockId>;
  readonly loweredRules: ReadonlySet<RuleSlug>;
  readonly path: UnitPath;
}

const REPOSITORY_NAME = '.';

const createUnit = (input: ProjectUnit): ProjectUnit => ({
  axes: input.axes,
  blocks: input.blocks,
  loweredRules: input.loweredRules,
  path: input.path,
});

const isRepositoryUnit = (unit: ProjectUnit): boolean => UnitPath.isRepository(unit.path);

/** The unit's folder as a message names it: "." for the repository. */
const nameOfUnit = (unit: ProjectUnit): string =>
  isRepositoryUnit(unit) ? REPOSITORY_NAME : unit.path;

const isLoweredIn = (unit: ProjectUnit, rule: RuleSlug): boolean => unit.loweredRules.has(rule);

const ProjectUnit = {
  create: createUnit,
  isLowered: isLoweredIn,
  isRepository: isRepositoryUnit,
  nameOf: nameOfUnit,
} as const;

export { ProjectUnit };
