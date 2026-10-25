import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';
import type { Version } from '#/kernel/value-objects';

import type { GitHooks, PluginRegistry, ProgramPath, ReleaseFeed } from '../../../contracts';
import type { PartDiagnosis } from '../../../entities';
import { hooksReport } from './steps/report-hooks';
import { linkReport } from './steps/report-link';
import { pathReport } from './steps/report-path';
import { pluginReport } from './steps/report-plugin';
import { programReport } from './steps/report-program';
import { releaseReport } from './steps/report-release';

interface DiagnoseInstallationPorts {
  readonly files: ProjectFiles;
  readonly hooks: GitHooks;
  readonly path: ProgramPath;
  readonly plugins: PluginRegistry;
  readonly releases: ReleaseFeed;
  readonly source: ProjectSource;
}

interface DiagnoseInstallationInput extends DiagnoseInstallationPorts {
  /** the fingerprint of the plugin's files this program was built with, if it can be read */
  readonly fingerprint: string | undefined;
  readonly program: Version;
  readonly start: string;
}

/** It changes nothing; the latest release is skipped where GitHub cannot be reached. */
const diagnoseInstallation = async (
  input: DiagnoseInstallationInput,
): Promise<readonly PartDiagnosis[]> => {
  const { program } = input;
  const latest = await input.releases.latest();
  const place = input.source.find(input.start);

  return [
    programReport(program),
    pluginReport({
      fingerprint: input.fingerprint,
      plugin: input.plugins.installed(),
      program,
    }),
    releaseReport({
      latest,
      program,
    }),
    pathReport({
      path: input.path,
      program,
    }),
    linkReport({
      files: input.files,
      place,
      program,
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
