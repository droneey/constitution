import { EXECUTABLE_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { AbsolutePath, Version } from '#/kernel/value-objects';

import { Diagnosis, PartDiagnosis } from '../../../../domain/entities';
import type {
  ExecutablePath,
  GitHooks,
  PinnedRelease,
  PluginRegistry,
  ReleaseFeed,
} from '../../../contracts';

interface DiagnoseInstallationPorts {
  readonly files: ProjectFiles;
  readonly hooks: GitHooks;
  readonly path: ExecutablePath;
  readonly pinned: PinnedRelease;
  readonly plugins: PluginRegistry;
  readonly releases: ReleaseFeed;
}

interface DiagnoseInstallationInput extends DiagnoseInstallationPorts {
  readonly executable: Version;
  readonly fingerprint: string | undefined;
  readonly startFolderPath: AbsolutePath;
}

const diagnoseInstallation = async (
  input: DiagnoseInstallationInput,
): Promise<readonly PartDiagnosis[]> => {
  const { executable } = input;
  const latest = await input.releases.latest();
  const place = input.pinned.findProjectAround(input.startFolderPath);
  const found = input.path.find(EXECUTABLE_NAME);

  return [
    {
      executable,
      kind: Diagnosis.ExecutableRuns,
    },
    PartDiagnosis.ofPlugin({
      executable,
      fingerprint: input.fingerprint,
      plugin: input.plugins.installed(),
    }),
    PartDiagnosis.ofLatest({
      executable,
      latest,
    }),
    PartDiagnosis.ofPath({
      executable,
      found:
        found === undefined
          ? undefined
          : {
              answered: input.path.versionOf(found),
              path: found,
            },
    }),
    PartDiagnosis.ofLink({
      executable,
      linked:
        place === undefined
          ? undefined
          : {
              place,
              release: input.pinned.readRelease(place),
              realFolderPath: input.files.realFolder(place.releaseFolderPath),
            },
    }),
    PartDiagnosis.ofHooks(
      place === undefined ? undefined : input.hooks.stateOf(place.repositoryFolderPath),
    ),
  ];
};

export type { DiagnoseInstallationPorts };
export { diagnoseInstallation };
