import type { ConfigurationsCheck, PresetsFinding } from '../../../entities';
import { PresetsCode } from '../../../entities';
import type { ComputeChangesInput } from '../compute-changes';
import { computeChanges } from '../compute-changes';
import type { FileComputed } from '../compute-files';
import { findReleaseLoops } from './steps/find-release-loops';

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
          path: file.filePath,
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
          path: file.filePath,
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
