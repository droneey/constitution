import { releaseFolderInProject } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import {
  AbsolutePath,
  BlockSource,
  PackPath,
  RepositoryRelativePath,
} from '#/kernel/value-objects';

import type { PresetSetsLoaded } from '../../../../domain/preset-entry/services';
import type { PresetsProject } from '../../../../domain/presets-project/entities';
import type { PresetFileParser } from '../../../contracts';
import { loadPresetSets } from './load-preset-sets';

interface LoadProjectPresetSetsInput {
  readonly files: ProjectFiles;
  readonly parser: PresetFileParser;
  readonly project: PresetsProject;
}

const releaseFolderPathFromRepository = RepositoryRelativePath.create(releaseFolderInProject);

const loadProjectPresetSets = (input: LoadProjectPresetSetsInput): readonly PresetSetsLoaded[] => {
  const { files, parser, project } = input;

  return [
    loadPresetSets({
      files,
      parser,
      source: BlockSource.create(),
      sourceFolderPath: project.releaseFolderPath,
      sourceFolderPathFromRepository: releaseFolderPathFromRepository,
    }),
    ...project.packs.map((pack) =>
      loadPresetSets({
        files,
        parser,
        source: BlockSource.create(pack),
        sourceFolderPath: AbsolutePath.join(project.repositoryFolderPath, PackPath.normalOf(pack)),
        sourceFolderPathFromRepository: RepositoryRelativePath.create(PackPath.normalOf(pack)),
      }),
    ),
  ];
};

export type { LoadProjectPresetSetsInput };
export { loadProjectPresetSets, releaseFolderPathFromRepository };
