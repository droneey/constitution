import { PATH_SEPARATOR, PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { RepositoryRelativePath } from '#/kernel/value-objects';
import { AbsolutePath } from '#/kernel/value-objects';

import { checkPresetSets, PackRoleNaming } from '../../../../domain/check-preset-sets/services';
import type { PresetsPlan } from '../../../../domain/presets-plan/entities';
import { Candidate } from '../../../../domain/presets-plan/entities';
import { presetsPlanOf, presetsSelectedOf } from '../../../../domain/presets-plan/services';
import type { PresetsProject } from '../../../../domain/presets-project/entities';
import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
} from '../../../contracts';
import { loadProjectPresetSets, releaseFolderPathFromRepository } from '../load-preset-sets';
import { readCheckInputs, releaseFilesOf } from '../read-check-inputs';

interface ComputePresetsInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly parser: PresetFileParser;
  readonly project: PresetsProject;
}

interface ConstitutionPathsInput {
  readonly candidates: readonly Candidate[];
  readonly files: ProjectFiles;
  readonly repositoryFolderPath: AbsolutePath;
}

const constitutionPathsOf = (
  input: ConstitutionPathsInput,
): ReadonlyMap<RepositoryRelativePath, string> => {
  const naming = new Map(
    input.candidates
      .filter((candidate) => Candidate.namesConstitutionPath(candidate))
      .map((candidate) => [
        Candidate.pathOf(candidate),
        candidate,
      ]),
  );

  return new Map(
    [
      ...naming,
    ].flatMap(([filePath, candidate]) => {
      const found = Candidate.releaseProbesOf(candidate).find((probe) =>
        input.files.isFolder(
          AbsolutePath.join(input.repositoryFolderPath, probe.releaseFolderPath),
        ),
      );

      return found === undefined
        ? []
        : [
            [
              filePath,
              found.constitutionPath,
            ] as const,
          ];
    }),
  );
};

const computePresets = (input: ComputePresetsInput): PresetsPlan => {
  const { files, parser, project } = input;
  const { model, units } = project;
  const loaded = loadProjectPresetSets({
    files,
    parser,
    project,
  });
  const selected = presetsSelectedOf({
    entries: loaded.flatMap((one) => one.entries),
    model,
    units,
  });
  const { entries } = selected;
  const release = releaseFilesOf({
    distribution: input.distribution,
    entries,
    files,
    folderPath: project.releaseFolderPath,
    folderPathFromRepository: releaseFolderPathFromRepository,
    model,
  });

  return presetsPlanOf({
    ...selected,
    constitutionPaths: constitutionPathsOf({
      candidates: selected.candidates,
      files,
      repositoryFolderPath: project.repositoryFolderPath,
    }),
    copiedTexts: new Map(
      [
        ...release.pluginTexts,
      ].map(([pathInPresets, text]) => [
        `${PRESETS_FOLDER_NAME}${PATH_SEPARATOR}${pathInPresets}`,
        text,
      ]),
    ),
    findings: [
      ...loaded.flatMap((one) => one.findings),
      ...checkPresetSets({
        entries,
        model,
        packRoleNaming: PackRoleNaming.ByIdOrName,
        release,
        ...readCheckInputs({
          entries,
          formats: input.formats,
          model,
        }),
      }),
    ],
    model,
    units,
  });
};

export type { ComputePresetsInput, ConstitutionPathsInput };
export { computePresets, constitutionPathsOf };
