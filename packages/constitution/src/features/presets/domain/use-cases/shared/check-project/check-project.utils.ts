import type { ProjectFiles } from '#/kernel/contracts';
import type { OpenedProject } from '#/kernel/entities';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
} from '../../../contracts';
import type { ConfigurationsCheck, LockRead, PresetsFinding } from '../../../entities';
import { PresetsCode } from '../../../entities';
import type { FileComputed } from '../compute-files';
import { computeFiles } from '../compute-files';
import { computePresets } from '../compute-presets';
import { releaseLoopsOf } from './steps/find-release-loops';

interface CheckProjectInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  /** by the unit's absolute folder */
  readonly lockOf: (folder: string) => LockRead;
  readonly parser: PresetFileParser;
  readonly project: OpenedProject;
}

// What an apply would change in a file, defaults aside.
const driftOf = (file: FileComputed): readonly PresetsFinding[] => [
  ...(file.missing.length === 0
    ? []
    : [
        {
          code: PresetsCode.Missing,
          details: {
            settings: file.missing.map(({ setting }) => setting),
          },
          path: file.file,
        } satisfies PresetsFinding,
      ]),
  ...(file.stale.length === 0
    ? []
    : [
        {
          code: PresetsCode.Stale,
          details: {
            settings: file.stale.map(({ setting }) => setting),
          },
          path: file.file,
        } satisfies PresetsFinding,
      ]),
  ...(file.unsorted.length === 0
    ? []
    : [
        {
          code: PresetsCode.Unsorted,
          details: {
            settings: file.unsorted.map(({ setting }) => setting),
          },
          path: file.file,
        } satisfies PresetsFinding,
      ]),
];

const checkProject = (input: CheckProjectInput): ConfigurationsCheck => {
  const { project } = input;
  const plan = computePresets({
    distribution: input.distribution,
    files: input.files,
    model: project.resolution.model,
    packs: project.packs,
    parser: input.parser,
    project: project.project,
    releaseFolder: project.releaseFolder,
    units: project.resolution.units,
  });
  const units = computeFiles({
    blocks: plan.blocks,
    files: input.files,
    formats: input.formats,
    lockOf: input.lockOf,
    plans: plan.files,
    project: project.project,
    units: project.resolution.units,
  });
  const files = units.flatMap((unit) => unit.files);

  return {
    findings: [
      ...plan.findings,
      ...units.flatMap((unit) => unit.findings),
      ...files.flatMap((file) => [
        ...file.findings,
        ...driftOf(file),
      ]),
    ],
    warnings: releaseLoopsOf({
      files: input.files,
      project: project.project,
      units: project.resolution.units,
    }),
  };
};

export type { CheckProjectInput };
export { checkProject };
