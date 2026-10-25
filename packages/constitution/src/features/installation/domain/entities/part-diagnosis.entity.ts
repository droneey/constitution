import type { Version } from '#/kernel/value-objects';

enum Health {
  Sound = 'sound',
  Warned = 'warned',
  Broken = 'broken',
  Skipped = 'skipped',
}

/** In the order doctor reports them. */
enum InstallationPart {
  Program = 'program',
  Plugin = 'plugin',
  Release = 'release',
  Path = 'path',
  Link = 'link',
  Hooks = 'hooks',
}

enum Diagnosis {
  ProgramRuns = 'program-runs',
  PluginMissing = 'plugin-missing',
  PluginMatches = 'plugin-matches',
  PluginDiffersAtItsVersion = 'plugin-differs-at-its-version',
  PluginOlder = 'plugin-older',
  PluginNewer = 'plugin-newer',
  LatestUnknown = 'latest-unknown',
  LatestAhead = 'latest-ahead',
  LatestHeld = 'latest-held',
  ProgramNotOnPath = 'program-not-on-path',
  PathMatches = 'path-matches',
  PathSilent = 'path-silent',
  PathDiffers = 'path-differs',
  LinkWithoutProject = 'link-without-project',
  ManifestUnreadable = 'manifest-unreadable',
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
  readonly plugin: Version;
  readonly program: Version;
}

/** Both as paths from the project. */
interface ReleaseLink {
  readonly folder: string;
  readonly target: string;
}

interface DiagnosisDetails {
  readonly [Diagnosis.ProgramRuns]: {
    readonly program: Version;
  };
  readonly [Diagnosis.PluginMissing]: object;
  readonly [Diagnosis.PluginMatches]: PluginVersions;
  readonly [Diagnosis.PluginDiffersAtItsVersion]: {
    readonly program: Version;
  };
  readonly [Diagnosis.PluginOlder]: PluginVersions;
  readonly [Diagnosis.PluginNewer]: PluginVersions;
  readonly [Diagnosis.LatestUnknown]: object;
  readonly [Diagnosis.LatestAhead]: {
    readonly latest: Version;
    readonly program: Version;
  };
  readonly [Diagnosis.LatestHeld]: {
    readonly latest: Version;
  };
  readonly [Diagnosis.ProgramNotOnPath]: object;
  readonly [Diagnosis.PathMatches]: {
    readonly path: string;
  };
  readonly [Diagnosis.PathSilent]: {
    readonly path: string;
  };
  readonly [Diagnosis.PathDiffers]: {
    readonly answered: string;
    readonly path: string;
    readonly program: Version;
  };
  readonly [Diagnosis.LinkWithoutProject]: object;
  readonly [Diagnosis.ManifestUnreadable]: {
    readonly manifest: string;
  };
  readonly [Diagnosis.ManifestWithoutVersion]: {
    readonly manifest: string;
  };
  readonly [Diagnosis.ReleaseMissing]: {
    readonly releaseFolder: string;
  };
  readonly [Diagnosis.ReleaseFormatNewer]: {
    readonly format: number;
  };
  readonly [Diagnosis.ReleaseFormatOlder]: object;
  readonly [Diagnosis.LinkMatches]: {
    readonly link: ReleaseLink;
  };
  readonly [Diagnosis.LinkDiffers]: {
    readonly link: ReleaseLink;
    readonly program: Version;
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
  [Diagnosis.ProgramRuns]: InstallationPart.Program,
  [Diagnosis.PluginMissing]: InstallationPart.Plugin,
  [Diagnosis.PluginMatches]: InstallationPart.Plugin,
  [Diagnosis.PluginDiffersAtItsVersion]: InstallationPart.Plugin,
  [Diagnosis.PluginOlder]: InstallationPart.Plugin,
  [Diagnosis.PluginNewer]: InstallationPart.Plugin,
  [Diagnosis.LatestUnknown]: InstallationPart.Release,
  [Diagnosis.LatestAhead]: InstallationPart.Release,
  [Diagnosis.LatestHeld]: InstallationPart.Release,
  [Diagnosis.ProgramNotOnPath]: InstallationPart.Path,
  [Diagnosis.PathMatches]: InstallationPart.Path,
  [Diagnosis.PathSilent]: InstallationPart.Path,
  [Diagnosis.PathDiffers]: InstallationPart.Path,
  [Diagnosis.LinkWithoutProject]: InstallationPart.Link,
  [Diagnosis.ManifestUnreadable]: InstallationPart.Link,
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
  [Diagnosis.ProgramRuns]: Health.Sound,
  [Diagnosis.PluginMissing]: Health.Warned,
  [Diagnosis.PluginMatches]: Health.Sound,
  [Diagnosis.PluginDiffersAtItsVersion]: Health.Warned,
  [Diagnosis.PluginOlder]: Health.Warned,
  [Diagnosis.PluginNewer]: Health.Warned,
  [Diagnosis.LatestUnknown]: Health.Skipped,
  [Diagnosis.LatestAhead]: Health.Warned,
  [Diagnosis.LatestHeld]: Health.Sound,
  [Diagnosis.ProgramNotOnPath]: Health.Broken,
  [Diagnosis.PathMatches]: Health.Sound,
  [Diagnosis.PathSilent]: Health.Warned,
  [Diagnosis.PathDiffers]: Health.Warned,
  [Diagnosis.LinkWithoutProject]: Health.Skipped,
  [Diagnosis.ManifestUnreadable]: Health.Broken,
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

const isTroubled = (diagnosis: PartDiagnosis): boolean => {
  const health = HEALTH_OF[diagnosis.kind];

  return health === Health.Warned || health === Health.Broken;
};

const PartDiagnosis = {
  healthOf: (diagnosis: PartDiagnosis): Health => HEALTH_OF[diagnosis.kind],
  isTroubled,
  partOf: (diagnosis: PartDiagnosis): InstallationPart => PART_OF[diagnosis.kind],
} as const;

export type { ReleaseLink };
export { Diagnosis, Health, InstallationPart, PartDiagnosis };
