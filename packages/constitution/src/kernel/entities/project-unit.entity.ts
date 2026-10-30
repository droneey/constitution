import type { Axis } from '../constants';
import type { BlockId, PackPath, RuleSlug } from '../value-objects';
import { UnitPath } from '../value-objects';

interface ProjectUnit {
  readonly axes: readonly Axis[];
  readonly blocks: ReadonlySet<BlockId>;
  readonly languages: ReadonlySet<BlockId>;
  readonly loweredRules: ReadonlySet<RuleSlug>;
  readonly name?: string;
  readonly packs: readonly PackPath[];
  readonly path: UnitPath;
}

// Why: exactOptionalPropertyTypes refuses a name given as undefined, so it is left out.
const createUnit = (
  input: Omit<ProjectUnit, 'name'> & {
    readonly name?: string | undefined;
  },
): ProjectUnit => ({
  axes: input.axes,
  blocks: input.blocks,
  languages: input.languages,
  loweredRules: input.loweredRules,
  ...(input.name === undefined
    ? {}
    : {
        name: input.name,
      }),
  packs: input.packs,
  path: input.path,
});

const isRepositoryUnit = (unit: ProjectUnit): boolean => UnitPath.isRepository(unit.path);

const ProjectUnit = {
  create: createUnit,
  isRepository: isRepositoryUnit,
} as const;

export { ProjectUnit };
