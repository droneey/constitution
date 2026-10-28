import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectPlace, Release } from '#/kernel/entities';
import { ReleaseStatus } from '#/kernel/entities';
import type { AbsolutePath, Version } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { PinnedRelease } from '../../../../../contracts';
import type { PartDiagnosis } from '../../../../../entities';
import { Diagnosis } from '../../../../../entities';

const unreadDiagnosisOf = (input: {
  release: Exclude<
    Release,
    {
      readonly status: ReleaseStatus.Installed;
    }
  >;
  releaseFolderPath: AbsolutePath;
}): PartDiagnosis => {
  const { release } = input;

  switch (release.status) {
    case ReleaseStatus.Missing:
      return {
        kind: Diagnosis.ReleaseMissing,
        releaseFolderPath: input.releaseFolderPath,
      };
    case ReleaseStatus.Older:
      return {
        kind: Diagnosis.ReleaseFormatOlder,
      };
    case ReleaseStatus.Newer:
      return {
        format: release.format,
        kind: Diagnosis.ReleaseFormatNewer,
      };
    case ReleaseStatus.ManifestUnreadable:
      return {
        kind: Diagnosis.ManifestUnreadable,
        manifest: release.manifest,
      };
    case ReleaseStatus.ManifestNotObject:
      return {
        kind: Diagnosis.ManifestNotObject,
        manifest: release.manifest,
      };
    case ReleaseStatus.ManifestMalformed:
      return {
        fields: release.fields,
        kind: Diagnosis.ManifestMalformed,
        manifest: release.manifest,
      };
    case ReleaseStatus.VersionMissing:
      return {
        kind: Diagnosis.ManifestWithoutVersion,
        manifest: release.manifest,
      };
    // Stryker disable next-line ConditionalExpression: no status reaches the default, which only the compiler reads
    default:
      return release satisfies never;
  }
};

interface ReportLinkInput {
  readonly executable: Version;
  readonly files: ProjectFiles;
  readonly pinned: PinnedRelease;
  readonly place: ProjectPlace | undefined;
}

const reportLink = (input: ReportLinkInput): PartDiagnosis => {
  const { place } = input;

  if (place === undefined) {
    return {
      kind: Diagnosis.LinkWithoutProject,
    };
  }

  const { releaseFolderPath, repositoryFolderPath } = place;
  const release = input.pinned.readRelease(place);

  if (release.status !== ReleaseStatus.Installed) {
    return unreadDiagnosisOf({
      release,
      releaseFolderPath,
    });
  }

  const fromRepository = (folderPath: AbsolutePath): RepositoryRelativePath | AbsolutePath =>
    RepositoryRelativePath.fromAbsolute(repositoryFolderPath, folderPath) ?? folderPath;

  const link = {
    linkPath: fromRepository(releaseFolderPath),
    targetPath: fromRepository(input.files.realFolder(releaseFolderPath) ?? releaseFolderPath),
  };

  return release.version === input.executable
    ? {
        kind: Diagnosis.LinkMatches,
        link,
      }
    : {
        executable: input.executable,
        kind: Diagnosis.LinkDiffers,
        link,
        release: release.version,
      };
};

export { reportLink };
