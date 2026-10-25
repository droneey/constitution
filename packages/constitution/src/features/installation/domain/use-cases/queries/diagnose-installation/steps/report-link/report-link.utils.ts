import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';
import type { ProjectPlace, Release } from '#/kernel/entities';
import { ReleaseStatus } from '#/kernel/entities';
import type { ProjectError } from '#/kernel/errors';
import { isProjectError, ProjectFailure } from '#/kernel/errors';
import type { Version } from '#/kernel/value-objects';

import type { PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

const releaseOf = (input: {
  place: ProjectPlace;
  source: ProjectSource;
}): Release | ProjectError => {
  try {
    return input.source.readRelease(input.place);
  } catch (error) {
    if (isProjectError(error)) {
      return error;
    }

    throw error;
  }
};

const unreadDiagnosisOf = (input: {
  release: Exclude<
    Release,
    {
      readonly status: ReleaseStatus.Installed;
    }
  >;
  releaseFolder: string;
}): PartDiagnosis => {
  const { release } = input;

  if (release.status === ReleaseStatus.Missing) {
    return {
      kind: Diagnosis.ReleaseMissing,
      releaseFolder: input.releaseFolder,
    };
  }

  if (release.status === ReleaseStatus.Older) {
    return {
      kind: Diagnosis.ReleaseFormatOlder,
    };
  }

  return {
    format: release.format,
    kind: Diagnosis.ReleaseFormatNewer,
  };
};

const linkReport = (input: {
  files: ProjectFiles;
  place: ProjectPlace | undefined;
  program: Version;
  source: ProjectSource;
}): PartDiagnosis => {
  const { place } = input;

  if (place === undefined) {
    return {
      kind: Diagnosis.LinkWithoutProject,
    };
  }

  const { releaseFolder, project } = place;
  const release = releaseOf({
    place,
    source: input.source,
  });

  if (isProjectError(release)) {
    return {
      kind:
        release.code === ProjectFailure.VersionMissing
          ? Diagnosis.ManifestWithoutVersion
          : Diagnosis.ManifestUnreadable,
      manifest: release.details.path,
    };
  }

  if (release.status !== ReleaseStatus.Installed) {
    return unreadDiagnosisOf({
      release,
      releaseFolder,
    });
  }

  const fromProject = (path: string): string =>
    path.startsWith(`${project}/`) ? path.slice(project.length + 1) : path;

  const link = {
    folder: fromProject(releaseFolder),
    target: fromProject(input.files.realFolder(releaseFolder) ?? releaseFolder),
  };

  return release.version === input.program
    ? {
        kind: Diagnosis.LinkMatches,
        link,
      }
    : {
        kind: Diagnosis.LinkDiffers,
        link,
        program: input.program,
        release: release.version,
      };
};

export { linkReport };
