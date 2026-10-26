import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';
import { UnitPath } from '#/kernel/value-objects';

import type { DistributionSources, PresetFileParser } from '../../../contracts';
import type { RunAsked, RunPlan, UnitRun } from '../../../entities';
import { PresetsCode } from '../../../entities';
import { computePresets } from '../../shared/compute-presets';

interface PlanRunInput extends RunAsked {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly parser: PresetFileParser;
  readonly source: ProjectSource;
}

const SEPARATOR = '/';
// The findings that bear on what runs; the files' own are the check's and the apply's.
const runCodes: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.Clash,
  PresetsCode.MissingSlot,
  PresetsCode.RunMisshapen,
  PresetsCode.SlotInNoList,
  PresetsCode.ToolWithoutRunner,
  PresetsCode.TwoReplacers,
]);

const folderOf = (project: string, unit: UnitPath): string =>
  UnitPath.isRepository(unit) ? project : `${project}${SEPARATOR}${unit}`;

// The unit whose folder holds the start most closely; the repository's runs every unit, its own
// first, as its check covers what no member's does.
const unitsToRun = (input: {
  project: string;
  start: string;
  units: readonly UnitPath[];
}): readonly UnitPath[] => {
  const start = input.start.slice(input.project.length + 1);
  const [closest] = input.units
    .filter((unit) => UnitPath.holds(unit, start))
    .toSorted((left, right) => right.length - left.length);

  // Stryker disable next-line ConditionalExpression: the repository's unit holds every start in the project
  return closest === undefined || UnitPath.isRepository(closest)
    ? input.units
    : [
        closest,
      ];
};

/**
 * Each unit's commands in the order its runners' entries give them.
 *
 * @throws {@link ProjectError} when no project is found, its release is not installed, or its
 * constitution.yaml or its blocks cannot be read
 */
const planRun = (input: PlanRunInput): RunPlan => {
  const opened = input.source.open(input.start);
  const plan = computePresets({
    distribution: input.distribution,
    files: input.files,
    model: opened.resolution.model,
    packs: opened.packs,
    parser: input.parser,
    project: opened.project,
    releaseFolder: opened.releaseFolder,
    units: opened.resolution.units,
  });
  const runs = new Map<string, UnitRun>(
    plan.runs.map((run) => [
      String(run.unit),
      run,
    ]),
  );
  const all = opened.resolution.units.map((unit) => unit.path);
  const asked = input.units;
  const units =
    asked === undefined
      ? unitsToRun({
          project: opened.project,
          start: input.start,
          units: all,
        })
      : all.filter((unit) => asked.includes(String(unit)));

  return {
    findings: plan.findings.filter((finding) => runCodes.has(finding.code)),
    steps: units.flatMap((unit) =>
      (runs.get(String(unit))?.commands.get(input.name) ?? []).map((command) => ({
        command,
        folder: folderOf(opened.project, unit),
        unit,
      })),
    ),
  };
};

export type { PlanRunInput };
export { planRun };
