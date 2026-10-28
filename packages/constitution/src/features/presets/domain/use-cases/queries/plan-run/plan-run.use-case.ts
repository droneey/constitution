import type { ProjectFiles } from '#/kernel/contracts';
import { AbsolutePath, RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
  ProjectReader,
} from '../../../contracts';
import type { PresetsProject, RunAsked, RunPlan, UnitRun } from '../../../entities';
import { PresetsCode, ProjectRead } from '../../../entities';
import { computePresets } from '../../shared/compute-presets';

interface PlanRunInput extends RunAsked {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly parser: PresetFileParser;
  readonly reader: ProjectReader;
}

const runCodes: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.Clash,
  PresetsCode.MissingSlot,
  PresetsCode.RunMisshapen,
  PresetsCode.SlotInNoList,
  PresetsCode.SlotPlacedTwice,
  PresetsCode.ToolWithoutRunner,
  PresetsCode.TwoReplacers,
]);

const unitsToRun = (input: {
  repositoryFolderPath: AbsolutePath;
  startFolderPath: AbsolutePath;
  unitPaths: readonly UnitPath[];
}): readonly UnitPath[] => {
  const startPathFromRepository = RepositoryRelativePath.fromAbsolute(
    input.repositoryFolderPath,
    input.startFolderPath,
  );

  // Stryker disable next-line ConditionalExpression,BlockStatement: without the return, only the repository's unit holds a start outside, which runs every unit as well
  if (startPathFromRepository === undefined) {
    return input.unitPaths;
  }

  const [closest] = input.unitPaths
    .filter((unitPath) => UnitPath.holds(unitPath, startPathFromRepository))
    .toSorted((left, right) => right.length - left.length);

  // Stryker disable next-line ConditionalExpression: the repository's unit holds every start in the project
  return closest === undefined || UnitPath.isRepository(closest)
    ? input.unitPaths
    : [
        closest,
      ];
};

const planOf = (
  input: PlanRunInput & {
    project: PresetsProject;
  },
): RunPlan => {
  const { project } = input;
  const { repositoryFolderPath } = project;
  const plan = computePresets(input);
  const runs = new Map<UnitPath, UnitRun>(
    plan.runs.map((run) => [
      run.unitPath,
      run,
    ]),
  );
  const allUnitPaths = project.units.map((unit) => unit.path);
  const askedUnitPaths = input.unitPaths;
  const unitPaths =
    askedUnitPaths === undefined
      ? unitsToRun({
          repositoryFolderPath,
          startFolderPath: input.startFolderPath,
          unitPaths: allUnitPaths,
        })
      : allUnitPaths.filter((unitPath) => askedUnitPaths.includes(unitPath));

  return {
    findings: plan.findings.filter((finding) => runCodes.has(finding.code)),
    steps: unitPaths.flatMap((unitPath) =>
      (runs.get(unitPath)?.commands.get(input.entryPoint) ?? []).map((command) => ({
        command,
        unitFolderPath: AbsolutePath.join(repositoryFolderPath, unitPath),
        unitPath,
      })),
    ),
  };
};

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const planRun = (input: PlanRunInput): ProjectRead<RunPlan> =>
  ProjectRead.map(input.reader.open(input.startFolderPath), (project) =>
    planOf({
      ...input,
      project,
    }),
  );

export type { PlanRunInput };
export { planRun };
