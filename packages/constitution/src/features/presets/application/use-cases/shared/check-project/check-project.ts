import type { ConfigurationsCheck, PresetsFinding } from '../../../../domain/entities';
import { PresetsCode } from '../../../../domain/entities';
import type { ComputeChangesInput } from '../compute-changes';
import { computeChanges } from '../compute-changes';
import type { FileComputed } from '../compute-files';
import { findReleaseLoops } from './steps/find-release-loops';

const driftOf = (file: FileComputed): readonly PresetsFinding[] => [
  ...(file.missingOrOutdated.length === 0
    ? []
    : [
        {
          code: PresetsCode.Missing,
          details: {
            settingPaths: file.missingOrOutdated.map(({ settingPath }) => settingPath),
          },
          path: file.filePath,
        } satisfies PresetsFinding,
      ]),
  ...(file.staleWithoutReplacement.length === 0
    ? []
    : [
        {
          code: PresetsCode.Stale,
          details: {
            settingPaths: file.staleWithoutReplacement.map(({ settingPath }) => settingPath),
          },
          path: file.filePath,
        } satisfies PresetsFinding,
      ]),
  ...(file.unsorted.length === 0
    ? []
    : [
        {
          code: PresetsCode.Unsorted,
          details: {
            settingPaths: file.unsorted.map(({ settingPath }) => settingPath),
          },
          path: file.filePath,
        } satisfies PresetsFinding,
      ]),
];

const checkProject = (input: ComputeChangesInput): ConfigurationsCheck => {
  const { project } = input;
  const { files, presetsFindings, units } = computeChanges(input);

  return {
    findings: [
      ...presetsFindings,
      ...units.flatMap((unit) => unit.findings),
      ...files.flatMap((file) => [
        ...file.findings,
        ...driftOf(file),
      ]),
    ],
    warnings: findReleaseLoops({
      files: input.files,
      repositoryFolderPath: project.repositoryFolderPath,
      units: project.units,
    }),
  };
};

export { checkProject };
