import type { Axis } from '../constants';
import type { BlockId, PackPath, RuleSlug } from '../value-objects';
import { UnitPath } from '../value-objects';

interface ProjectUnit {
  readonly axes: readonly Axis[];
  readonly blocks: ReadonlySet<BlockId>;
  /** the language blocks among its blocks */
  readonly languages: ReadonlySet<BlockId>;
  readonly loweredRules: ReadonlySet<RuleSlug>;
  /** the name of its package, as its constitution.yaml writes it */
  readonly name?: string;
  /** the packs it lists, each by its path from the repository */
  readonly packs: readonly PackPath[];
  readonly path: UnitPath;
}

/** name may be given as undefined, which leaves it out */
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

const isLoweredIn = (unit: ProjectUnit, rule: RuleSlug): boolean => unit.loweredRules.has(rule);

const ProjectUnit = {
  create: createUnit,
  isLowered: isLoweredIn,
  isRepository: isRepositoryUnit,
} as const;

export { ProjectUnit };
