import type { ProjectFiles } from '#/kernel/contracts';
import type { AbsolutePath, Version } from '#/kernel/value-objects';

import type {
  ExecutablePath,
  GitHooks,
  PinnedRelease,
  PluginRegistry,
  ReleaseFeed,
} from '../../../contracts';
import type { PartDiagnosis } from '../../../entities';
import { Diagnosis } from '../../../entities';
import { reportHooks } from './steps/report-hooks';
import { reportLink } from './steps/report-link';
import { reportPath } from './steps/report-path';
import { reportPlugin } from './steps/report-plugin';
import { reportRelease } from './steps/report-release';

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
  /** the fingerprint of the plugin's files this executable was built with, if it can be read */
  readonly fingerprint: string | undefined;
  readonly startFolderPath: AbsolutePath;
}

/** It changes nothing; the latest release is skipped where GitHub cannot be reached. */
const diagnoseInstallation = async (
  input: DiagnoseInstallationInput,
): Promise<readonly PartDiagnosis[]> => {
  const { executable } = input;
  const latest = await input.releases.latest();
  const place = input.pinned.find(input.startFolderPath);

  return [
    {
      executable,
      kind: Diagnosis.ExecutableRuns,
    },
    reportPlugin({
      executable,
      fingerprint: input.fingerprint,
      plugin: input.plugins.installed(),
    }),
    reportRelease({
      executable,
      latest,
    }),
    reportPath({
      executable,
      path: input.path,
    }),
    reportLink({
      executable,
      files: input.files,
      pinned: input.pinned,
      place,
    }),
    reportHooks({
      hooks: input.hooks,
      repositoryFolderPath: place?.repositoryFolderPath,
    }),
  ];
};

export type { DiagnoseInstallationPorts };
export { diagnoseInstallation };
