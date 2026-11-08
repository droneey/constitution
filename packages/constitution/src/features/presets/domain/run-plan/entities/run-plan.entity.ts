import { AbsolutePath, RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import type { PresetsProject } from '../../presets-project/entities';
import type { PresetsFinding } from '../../shared/entities';
import { PresetsCode } from '../../shared/entities';
import { DiagnosticIndex } from './diagnostic-index.entity';

enum EntryPoint {
  Check = 'check',
  Test = 'test',
  Fix = 'fix',
}

interface RunAsked {
  readonly entryPoint: EntryPoint;
  readonly startFolderPath: AbsolutePath;
  readonly unitPaths?: readonly UnitPath[];
}

interface CommandRan {
  readonly code: number;
  readonly output: string;
}

interface CommandToRun {
  readonly command: string;
  readonly folderPath: AbsolutePath;
}

interface RunStep {
  readonly command: string;
  readonly diagnostics: DiagnosticIndex;
  readonly unitFolderPath: AbsolutePath;
  readonly unitPath: UnitPath;
}

interface UnitRun {
  readonly commands: ReadonlyMap<EntryPoint, readonly string[]>;
  readonly unitPath: UnitPath;
}

interface RunPlan {
  readonly findings: readonly PresetsFinding[];
  readonly steps: readonly RunStep[];
}

interface RunPlanInput {
  readonly asked: RunAsked;
  readonly findings: readonly PresetsFinding[];
  readonly indexes: ReadonlyMap<UnitPath, DiagnosticIndex>;
  readonly project: Pick<PresetsProject, 'repositoryFolderPath' | 'units'>;
  readonly runs: readonly UnitRun[];
}

const runCodes: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.Clash,
  PresetsCode.InheritanceMalformed,
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

const of = (input: RunPlanInput): RunPlan => {
  const { asked, project } = input;
  const { repositoryFolderPath } = project;
  const runs = new Map<UnitPath, UnitRun>(
    input.runs.map((run) => [
      run.unitPath,
      run,
    ]),
  );
  const allUnitPaths = project.units.map((unit) => unit.path);
  const askedUnitPaths = asked.unitPaths;
  const unitPaths =
    askedUnitPaths === undefined
      ? unitsToRun({
          repositoryFolderPath,
          startFolderPath: asked.startFolderPath,
          unitPaths: allUnitPaths,
        })
      : allUnitPaths.filter((unitPath) => askedUnitPaths.includes(unitPath));

  return {
    findings: input.findings.filter((finding) => runCodes.has(finding.code)),
    steps: unitPaths.flatMap((unitPath) =>
      (runs.get(unitPath)?.commands.get(asked.entryPoint) ?? []).map((command) => ({
        command,
        diagnostics: input.indexes.get(unitPath) ?? DiagnosticIndex.empty,
        unitFolderPath: AbsolutePath.join(repositoryFolderPath, unitPath),
        unitPath,
      })),
    ),
  };
};

const RunPlan = {
  of,
} as const;

export type { CommandRan, CommandToRun, RunAsked, RunStep, UnitRun };
export { EntryPoint, RunPlan };
