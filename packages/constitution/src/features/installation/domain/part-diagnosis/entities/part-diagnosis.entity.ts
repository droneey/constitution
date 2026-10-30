import type { ProjectPlace, Release } from '#/kernel/entities';
import { ReleaseStatus } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';
import { RepositoryRelativePath, Version } from '#/kernel/value-objects';

import { HooksState } from '../../hooks-state/entities';
import type { InstalledPlugin } from '../../installed-plugin/entities';
import type { LatestRelease } from '../../latest-release/entities';
import { ReleaseLookup } from '../../latest-release/entities';

enum Health {
  Sound = 'sound',
  Warned = 'warned',
  Broken = 'broken',
  Skipped = 'skipped',
}

enum InstallationPart {
  Executable = 'executable',
  Plugin = 'plugin',
  Release = 'release',
  Path = 'path',
  Link = 'link',
  Hooks = 'hooks',
}

enum Diagnosis {
  ExecutableRuns = 'executable-runs',
  PluginMissing = 'plugin-missing',
  PluginMatches = 'plugin-matches',
  PluginDiffersAtItsVersion = 'plugin-differs-at-its-version',
  PluginOlder = 'plugin-older',
  PluginNewer = 'plugin-newer',
  LatestUnanswered = 'latest-unanswered',
  LatestRefused = 'latest-refused',
  LatestUnreadable = 'latest-unreadable',
  LatestAhead = 'latest-ahead',
  LatestHeld = 'latest-held',
  ExecutableNotOnPath = 'executable-not-on-path',
  PathMatches = 'path-matches',
  PathSilent = 'path-silent',
  PathDiffers = 'path-differs',
  LinkWithoutProject = 'link-without-project',
  ManifestUnreadable = 'manifest-unreadable',
  ManifestNotObject = 'manifest-not-object',
  ManifestMalformed = 'manifest-malformed',
  ManifestWithoutVersion = 'manifest-without-version',
  ReleaseMissing = 'release-missing',
  ReleaseFormatNewer = 'release-format-newer',
  ReleaseFormatOlder = 'release-format-older',
  LinkMatches = 'link-matches',
  LinkDiffers = 'link-differs',
  HooksWithoutProject = 'hooks-without-project',
  HooksInstalled = 'hooks-installed',
  HooksMissing = 'hooks-missing',
  HooksUnavailable = 'hooks-unavailable',
  HooksUnconfigured = 'hooks-unconfigured',
}

interface PluginVersions {
  readonly executable: Version;
  readonly plugin: Version;
}

interface ReleaseLink {
  readonly linkPath: RepositoryRelativePath | AbsolutePath;
  readonly targetPath: RepositoryRelativePath | AbsolutePath;
}

interface DiagnosisDetails {
  readonly [Diagnosis.ExecutableRuns]: {
    readonly executable: Version;
  };
  readonly [Diagnosis.PluginMissing]: object;
  readonly [Diagnosis.PluginMatches]: PluginVersions;
  readonly [Diagnosis.PluginDiffersAtItsVersion]: {
    readonly executable: Version;
  };
  readonly [Diagnosis.PluginOlder]: PluginVersions;
  readonly [Diagnosis.PluginNewer]: PluginVersions;
  readonly [Diagnosis.LatestUnanswered]: {
    readonly reason: string;
  };
  readonly [Diagnosis.LatestRefused]: {
    readonly status: number;
  };
  readonly [Diagnosis.LatestUnreadable]: object;
  readonly [Diagnosis.LatestAhead]: {
    readonly executable: Version;
    readonly latest: Version;
  };
  readonly [Diagnosis.LatestHeld]: {
    readonly latest: Version;
  };
  readonly [Diagnosis.ExecutableNotOnPath]: object;
  readonly [Diagnosis.PathMatches]: {
    readonly path: AbsolutePath;
  };
  readonly [Diagnosis.PathSilent]: {
    readonly path: AbsolutePath;
  };
  readonly [Diagnosis.PathDiffers]: {
    readonly answered: string;
    readonly executable: Version;
    readonly path: AbsolutePath;
  };
  readonly [Diagnosis.LinkWithoutProject]: object;
  readonly [Diagnosis.ManifestUnreadable]: {
    readonly manifest: AbsolutePath;
  };
  readonly [Diagnosis.ManifestNotObject]: {
    readonly manifest: AbsolutePath;
  };
  readonly [Diagnosis.ManifestMalformed]: {
    readonly fields: readonly string[];
    readonly manifest: AbsolutePath;
  };
  readonly [Diagnosis.ManifestWithoutVersion]: {
    readonly manifest: AbsolutePath;
  };
  readonly [Diagnosis.ReleaseMissing]: {
    readonly releaseFolderPath: AbsolutePath;
  };
  readonly [Diagnosis.ReleaseFormatNewer]: {
    readonly format: number;
  };
  readonly [Diagnosis.ReleaseFormatOlder]: object;
  readonly [Diagnosis.LinkMatches]: {
    readonly link: ReleaseLink;
  };
  readonly [Diagnosis.LinkDiffers]: {
    readonly executable: Version;
    readonly link: ReleaseLink;
    readonly release: Version;
  };
  readonly [Diagnosis.HooksWithoutProject]: object;
  readonly [Diagnosis.HooksInstalled]: object;
  readonly [Diagnosis.HooksMissing]: object;
  readonly [Diagnosis.HooksUnavailable]: object;
  readonly [Diagnosis.HooksUnconfigured]: object;
}

type PartDiagnosis<TKind extends Diagnosis = Diagnosis> = {
  readonly [TEach in TKind]: DiagnosisDetails[TEach] & {
    readonly kind: TEach;
  };
}[TKind];

const PART_OF = {
  [Diagnosis.ExecutableRuns]: InstallationPart.Executable,
  [Diagnosis.PluginMissing]: InstallationPart.Plugin,
  [Diagnosis.PluginMatches]: InstallationPart.Plugin,
  [Diagnosis.PluginDiffersAtItsVersion]: InstallationPart.Plugin,
  [Diagnosis.PluginOlder]: InstallationPart.Plugin,
  [Diagnosis.PluginNewer]: InstallationPart.Plugin,
  [Diagnosis.LatestUnanswered]: InstallationPart.Release,
  [Diagnosis.LatestRefused]: InstallationPart.Release,
  [Diagnosis.LatestUnreadable]: InstallationPart.Release,
  [Diagnosis.LatestAhead]: InstallationPart.Release,
  [Diagnosis.LatestHeld]: InstallationPart.Release,
  [Diagnosis.ExecutableNotOnPath]: InstallationPart.Path,
  [Diagnosis.PathMatches]: InstallationPart.Path,
  [Diagnosis.PathSilent]: InstallationPart.Path,
  [Diagnosis.PathDiffers]: InstallationPart.Path,
  [Diagnosis.LinkWithoutProject]: InstallationPart.Link,
  [Diagnosis.ManifestUnreadable]: InstallationPart.Link,
  [Diagnosis.ManifestNotObject]: InstallationPart.Link,
  [Diagnosis.ManifestMalformed]: InstallationPart.Link,
  [Diagnosis.ManifestWithoutVersion]: InstallationPart.Link,
  [Diagnosis.ReleaseMissing]: InstallationPart.Link,
  [Diagnosis.ReleaseFormatNewer]: InstallationPart.Link,
  [Diagnosis.ReleaseFormatOlder]: InstallationPart.Link,
  [Diagnosis.LinkMatches]: InstallationPart.Link,
  [Diagnosis.LinkDiffers]: InstallationPart.Link,
  [Diagnosis.HooksWithoutProject]: InstallationPart.Hooks,
  [Diagnosis.HooksInstalled]: InstallationPart.Hooks,
  [Diagnosis.HooksMissing]: InstallationPart.Hooks,
  [Diagnosis.HooksUnavailable]: InstallationPart.Hooks,
  [Diagnosis.HooksUnconfigured]: InstallationPart.Hooks,
} as const satisfies Readonly<Record<Diagnosis, InstallationPart>>;

const HEALTH_OF = {
  [Diagnosis.ExecutableRuns]: Health.Sound,
  [Diagnosis.PluginMissing]: Health.Warned,
  [Diagnosis.PluginMatches]: Health.Sound,
  [Diagnosis.PluginDiffersAtItsVersion]: Health.Warned,
  [Diagnosis.PluginOlder]: Health.Warned,
  [Diagnosis.PluginNewer]: Health.Warned,
  [Diagnosis.LatestUnanswered]: Health.Skipped,
  [Diagnosis.LatestRefused]: Health.Skipped,
  [Diagnosis.LatestUnreadable]: Health.Skipped,
  [Diagnosis.LatestAhead]: Health.Warned,
  [Diagnosis.LatestHeld]: Health.Sound,
  [Diagnosis.ExecutableNotOnPath]: Health.Broken,
  [Diagnosis.PathMatches]: Health.Sound,
  [Diagnosis.PathSilent]: Health.Warned,
  [Diagnosis.PathDiffers]: Health.Warned,
  [Diagnosis.LinkWithoutProject]: Health.Skipped,
  [Diagnosis.ManifestUnreadable]: Health.Broken,
  [Diagnosis.ManifestNotObject]: Health.Broken,
  [Diagnosis.ManifestMalformed]: Health.Broken,
  [Diagnosis.ManifestWithoutVersion]: Health.Broken,
  [Diagnosis.ReleaseMissing]: Health.Broken,
  [Diagnosis.ReleaseFormatNewer]: Health.Broken,
  [Diagnosis.ReleaseFormatOlder]: Health.Broken,
  [Diagnosis.LinkMatches]: Health.Sound,
  [Diagnosis.LinkDiffers]: Health.Warned,
  [Diagnosis.HooksWithoutProject]: Health.Skipped,
  [Diagnosis.HooksInstalled]: Health.Sound,
  [Diagnosis.HooksMissing]: Health.Warned,
  [Diagnosis.HooksUnavailable]: Health.Warned,
  [Diagnosis.HooksUnconfigured]: Health.Skipped,
} as const satisfies Readonly<Record<Diagnosis, Health>>;

const healthOf = (diagnosis: PartDiagnosis): Health => HEALTH_OF[diagnosis.kind];

const isTroubled = (diagnosis: PartDiagnosis): boolean => {
  const health = healthOf(diagnosis);

  return health === Health.Warned || health === Health.Broken;
};

const partOf = (diagnosis: PartDiagnosis): InstallationPart => PART_OF[diagnosis.kind];

const DIAGNOSIS_OF_HOOKS = {
  [HooksState.Installed]: Diagnosis.HooksInstalled,
  [HooksState.Missing]: Diagnosis.HooksMissing,
  [HooksState.Unavailable]: Diagnosis.HooksUnavailable,
  [HooksState.Unconfigured]: Diagnosis.HooksUnconfigured,
} as const satisfies Readonly<Record<HooksState, Diagnosis>>;

/** The hooks' state is undefined where no project lies around the start. */
const ofHooks = (state: HooksState | undefined): PartDiagnosis => ({
  kind: state === undefined ? Diagnosis.HooksWithoutProject : DIAGNOSIS_OF_HOOKS[state],
});

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

interface LinkedRelease {
  readonly place: ProjectPlace;
  readonly realFolderPath: AbsolutePath | undefined;
  readonly release: Release;
}

/** The linked release is undefined where no project lies around the start. */
const ofLink = (input: {
  executable: Version;
  linked: LinkedRelease | undefined;
}): PartDiagnosis => {
  const { linked } = input;

  if (linked === undefined) {
    return {
      kind: Diagnosis.LinkWithoutProject,
    };
  }

  const { release } = linked;
  const { releaseFolderPath, repositoryFolderPath } = linked.place;

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
    targetPath: fromRepository(linked.realFolderPath ?? releaseFolderPath),
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

interface FoundExecutable {
  readonly answered: string | undefined;
  readonly path: AbsolutePath;
}

/** The found executable is undefined where none lies on PATH. */
const ofPath = (input: {
  executable: Version;
  found: FoundExecutable | undefined;
}): PartDiagnosis => {
  const { found } = input;

  if (found === undefined) {
    return {
      kind: Diagnosis.ExecutableNotOnPath,
    };
  }

  const { answered, path } = found;

  if (answered === undefined) {
    return {
      kind: Diagnosis.PathSilent,
      path,
    };
  }

  return answered === input.executable
    ? {
        kind: Diagnosis.PathMatches,
        path,
      }
    : {
        answered,
        executable: input.executable,
        kind: Diagnosis.PathDiffers,
        path,
      };
};

const ofPlugin = (input: {
  executable: Version;
  fingerprint: string | undefined;
  plugin: InstalledPlugin | undefined;
}): PartDiagnosis => {
  const { executable, plugin } = input;

  if (plugin === undefined) {
    return {
      kind: Diagnosis.PluginMissing,
    };
  }

  if (plugin.fingerprint !== undefined && plugin.fingerprint === input.fingerprint) {
    return {
      executable,
      kind: Diagnosis.PluginMatches,
      plugin: plugin.version,
    };
  }

  const order = Version.compare(plugin.version, executable);

  if (order === 0) {
    return {
      executable,
      kind: Diagnosis.PluginDiffersAtItsVersion,
    };
  }

  return {
    executable,
    kind: order === -1 ? Diagnosis.PluginOlder : Diagnosis.PluginNewer,
    plugin: plugin.version,
  };
};

const ofLatest = (input: { executable: Version; latest: LatestRelease }): PartDiagnosis => {
  const { executable, latest } = input;

  switch (latest.lookup) {
    case ReleaseLookup.Found:
      return Version.compare(executable, latest.version) < 0
        ? {
            executable,
            kind: Diagnosis.LatestAhead,
            latest: latest.version,
          }
        : {
            kind: Diagnosis.LatestHeld,
            latest: latest.version,
          };
    case ReleaseLookup.Unanswered:
      return {
        kind: Diagnosis.LatestUnanswered,
        reason: latest.reason,
      };
    case ReleaseLookup.Refused:
      return {
        kind: Diagnosis.LatestRefused,
        status: latest.status,
      };
    case ReleaseLookup.Unreadable:
      return {
        kind: Diagnosis.LatestUnreadable,
      };
    // Stryker disable next-line ConditionalExpression: no lookup reaches the default, which only the compiler reads
    default:
      return latest satisfies never;
  }
};

const PartDiagnosis = {
  healthOf,
  isTroubled,
  ofHooks,
  ofLatest,
  ofLink,
  ofPath,
  ofPlugin,
  partOf,
} as const;

export { Diagnosis, Health, InstallationPart, PartDiagnosis };
