import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';
import type { Version } from '#/kernel/value-objects';

import type { ExecutablePath, GitHooks, PluginRegistry, ReleaseFeed } from '../../../contracts';
import type { PartDiagnosis } from '../../../entities';
import { executableReport } from './steps/report-executable';
import { hooksReport } from './steps/report-hooks';
import { linkReport } from './steps/report-link';
import { pathReport } from './steps/report-path';
import { pluginReport } from './steps/report-plugin';
import { releaseReport } from './steps/report-release';

interface DiagnoseInstallationPorts {
  readonly files: ProjectFiles;
  readonly hooks: GitHooks;
  readonly path: ExecutablePath;
  readonly plugins: PluginRegistry;
  readonly releases: ReleaseFeed;
  readonly source: ProjectSource;
}

interface DiagnoseInstallationInput extends DiagnoseInstallationPorts {
  readonly executable: Version;
  /** the fingerprint of the plugin's files this executable was built with, if it can be read */
  readonly fingerprint: string | undefined;
  readonly start: string;
}

/** It changes nothing; the latest release is skipped where GitHub cannot be reached. */
const diagnoseInstallation = async (
  input: DiagnoseInstallationInput,
): Promise<readonly PartDiagnosis[]> => {
  const { executable } = input;
  const latest = await input.releases.latest();
  const place = input.source.find(input.start);

  return [
    executableReport(executable),
    pluginReport({
      executable,
      fingerprint: input.fingerprint,
      plugin: input.plugins.installed(),
    }),
    releaseReport({
      executable,
      latest,
    }),
    pathReport({
      executable,
      path: input.path,
    }),
    linkReport({
      executable,
      files: input.files,
      place,
      source: input.source,
    }),
    hooksReport({
      hooks: input.hooks,
      project: place?.project,
    }),
  ];
};

export type { DiagnoseInstallationPorts };
export { diagnoseInstallation };
