import { describe, expect, it } from 'bun:test';

import type { ProjectPlace, Release } from '#/kernel/entities';
import { ReleaseStatus } from '#/kernel/entities';
import { AbsolutePath, RepositoryRelativePath, Version } from '#/kernel/value-objects';

import { HooksState } from '../../../hooks-state/entities';
import type { InstalledPlugin } from '../../../installed-plugin/entities';
import type { LatestRelease } from '../../../latest-release/entities';
import { ReleaseLookup } from '../../../latest-release/entities';
import { Diagnosis, Health, PartDiagnosis } from '../part-diagnosis.entity';

const FINGERPRINT = 'f1';
const PROJECT = '/work/project';
const executable = Version.create('1.0.0');
const older = Version.create('0.9.0');
const newer = Version.create('1.0.1');
const onPath = AbsolutePath.create('/home/me/.local/bin/constitution');
const place: ProjectPlace = {
  releaseFolderPath: AbsolutePath.create(`${PROJECT}/.droneey/constitution`),
  repositoryFolderPath: AbsolutePath.create(PROJECT),
};
const manifest = AbsolutePath.create(`${PROJECT}/.droneey/constitution/package.json`);
const linkFolder = RepositoryRelativePath.create('.droneey/constitution');

interface Reading {
  readonly diagnosis: PartDiagnosis;
  readonly health: Health;
}

const readingOf = (diagnosis: PartDiagnosis): Reading => ({
  diagnosis,
  health: PartDiagnosis.healthOf(diagnosis),
});

describe('PartDiagnosis.ofPlugin', () => {
  it.each<{
    condition: string;
    expected: PartDiagnosis;
    fingerprint?: string | undefined;
    health: Health;
    plugin: InstalledPlugin | undefined;
  }>([
    {
      condition: 'the plugin is not installed',
      expected: {
        kind: Diagnosis.PluginMissing,
      },
      health: Health.Warned,
      plugin: undefined,
    },
    {
      condition: 'the plugin is older than the executable and its files differ',
      expected: {
        executable,
        kind: Diagnosis.PluginOlder,
        plugin: older,
      },
      health: Health.Warned,
      plugin: {
        fingerprint: 'f0',
        version: older,
      },
    },
    {
      condition: 'the plugin is newer than the executable and its files differ',
      expected: {
        executable,
        kind: Diagnosis.PluginNewer,
        plugin: newer,
      },
      health: Health.Warned,
      plugin: {
        fingerprint: 'f2',
        version: newer,
      },
    },
    {
      condition: "the plugin is another release whose files are the executable's",
      expected: {
        executable,
        kind: Diagnosis.PluginMatches,
        plugin: older,
      },
      health: Health.Sound,
      plugin: {
        fingerprint: FINGERPRINT,
        version: older,
      },
    },
    {
      condition:
        "the plugin's files differ from constitution's at one version, as a working tree's do",
      expected: {
        executable,
        kind: Diagnosis.PluginDiffersAtItsVersion,
      },
      health: Health.Warned,
      plugin: {
        fingerprint: 'f0',
        version: executable,
      },
    },
    {
      condition: "the plugin is this executable's release with its files",
      expected: {
        executable,
        kind: Diagnosis.PluginMatches,
        plugin: executable,
      },
      health: Health.Sound,
      plugin: {
        fingerprint: FINGERPRINT,
        version: executable,
      },
    },
    {
      condition: "neither the plugin's files nor the executable's can be read",
      expected: {
        executable,
        kind: Diagnosis.PluginDiffersAtItsVersion,
      },
      fingerprint: undefined,
      health: Health.Warned,
      plugin: {
        version: executable,
      },
    },
    {
      condition: "the plugin's files cannot be read",
      expected: {
        executable,
        kind: Diagnosis.PluginDiffersAtItsVersion,
      },
      health: Health.Warned,
      plugin: {
        version: executable,
      },
    },
  ])(
    'should diagnose $expected.kind, $health, when $condition',
    ({ expected, health, ...given }) => {
      // Arrange
      const found = {
        executable,
        fingerprint: 'fingerprint' in given ? given.fingerprint : FINGERPRINT,
        plugin: given.plugin,
      };

      // Act
      const reading = readingOf(PartDiagnosis.ofPlugin(found));

      // Assert
      expect(reading).toStrictEqual({
        diagnosis: expected,
        health,
      });
    },
  );
});

describe('PartDiagnosis.ofLatest', () => {
  it.each<{
    condition: string;
    expected: PartDiagnosis;
    health: Health;
    latest: LatestRelease;
  }>([
    {
      condition: 'a newer release is out',
      expected: {
        executable,
        kind: Diagnosis.LatestAhead,
        latest: Version.create('1.1.0'),
      },
      health: Health.Warned,
      latest: {
        lookup: ReleaseLookup.Found,
        version: Version.create('1.1.0'),
      },
    },
    {
      condition: 'the executable is the latest release',
      expected: {
        kind: Diagnosis.LatestHeld,
        latest: executable,
      },
      health: Health.Sound,
      latest: {
        lookup: ReleaseLookup.Found,
        version: executable,
      },
    },
    {
      condition: 'the executable is ahead of the latest release',
      expected: {
        kind: Diagnosis.LatestHeld,
        latest: Version.create('0.9.9'),
      },
      health: Health.Sound,
      latest: {
        lookup: ReleaseLookup.Found,
        version: Version.create('0.9.9'),
      },
    },
    {
      condition: 'GitHub cannot be reached',
      expected: {
        kind: Diagnosis.LatestUnanswered,
        reason: 'fetch failed',
      },
      health: Health.Skipped,
      latest: {
        lookup: ReleaseLookup.Unanswered,
        reason: 'fetch failed',
      },
    },
    {
      condition: 'GitHub refuses the call',
      expected: {
        kind: Diagnosis.LatestRefused,
        status: 403,
      },
      health: Health.Skipped,
      latest: {
        lookup: ReleaseLookup.Refused,
        status: 403,
      },
    },
    {
      condition: "GitHub's answer names no release",
      expected: {
        kind: Diagnosis.LatestUnreadable,
      },
      health: Health.Skipped,
      latest: {
        lookup: ReleaseLookup.Unreadable,
      },
    },
  ])('should diagnose $expected.kind, $health, when $condition', ({ expected, health, latest }) => {
    // Arrange
    const found = {
      executable,
      latest,
    };

    // Act
    const reading = readingOf(PartDiagnosis.ofLatest(found));

    // Assert
    expect(reading).toStrictEqual({
      diagnosis: expected,
      health,
    });
  });
});

describe('PartDiagnosis.ofPath', () => {
  it.each<{
    condition: string;
    expected: PartDiagnosis;
    found:
      | {
          answered: string | undefined;
          path: AbsolutePath;
        }
      | undefined;
    health: Health;
  }>([
    {
      condition: 'the executable is not on PATH',
      expected: {
        kind: Diagnosis.ExecutableNotOnPath,
      },
      found: undefined,
      health: Health.Broken,
    },
    {
      condition: 'the executable on PATH names no version',
      expected: {
        kind: Diagnosis.PathSilent,
        path: onPath,
      },
      found: {
        answered: undefined,
        path: onPath,
      },
      health: Health.Warned,
    },
    {
      condition: 'the executable on PATH is another release',
      expected: {
        answered: '0.9.0',
        executable,
        kind: Diagnosis.PathDiffers,
        path: onPath,
      },
      found: {
        answered: '0.9.0',
        path: onPath,
      },
      health: Health.Warned,
    },
    {
      condition: 'the executable on PATH is this release',
      expected: {
        kind: Diagnosis.PathMatches,
        path: onPath,
      },
      found: {
        answered: executable,
        path: onPath,
      },
      health: Health.Sound,
    },
  ])('should diagnose $expected.kind, $health, when $condition', ({ expected, found, health }) => {
    // Arrange
    const given = {
      executable,
      found,
    };

    // Act
    const reading = readingOf(PartDiagnosis.ofPath(given));

    // Assert
    expect(reading).toStrictEqual({
      diagnosis: expected,
      health,
    });
  });
});

describe('PartDiagnosis.ofLink', () => {
  it.each<{
    condition: string;
    expected: PartDiagnosis;
    health: Health;
    release: Release;
  }>([
    {
      condition: 'no release is linked',
      expected: {
        kind: Diagnosis.ReleaseMissing,
        releaseFolderPath: place.releaseFolderPath,
      },
      health: Health.Broken,
      release: {
        status: ReleaseStatus.Missing,
      },
    },
    {
      condition: 'the linked release is of a newer block format',
      expected: {
        format: 9,
        kind: Diagnosis.ReleaseFormatNewer,
      },
      health: Health.Broken,
      release: {
        format: 9,
        status: ReleaseStatus.Newer,
      },
    },
    {
      condition: 'the linked release is of an older block format',
      expected: {
        kind: Diagnosis.ReleaseFormatOlder,
      },
      health: Health.Broken,
      release: {
        status: ReleaseStatus.Older,
      },
    },
    {
      condition: 'the linked release names no version',
      expected: {
        kind: Diagnosis.ManifestWithoutVersion,
        manifest,
      },
      health: Health.Broken,
      release: {
        manifest,
        status: ReleaseStatus.VersionMissing,
      },
    },
    {
      condition: "the linked release's manifest cannot be read",
      expected: {
        kind: Diagnosis.ManifestUnreadable,
        manifest,
      },
      health: Health.Broken,
      release: {
        manifest,
        status: ReleaseStatus.ManifestUnreadable,
      },
    },
    {
      condition: "the linked release's manifest is no JSON object",
      expected: {
        kind: Diagnosis.ManifestNotObject,
        manifest,
      },
      health: Health.Broken,
      release: {
        manifest,
        status: ReleaseStatus.ManifestNotObject,
      },
    },
    {
      condition: "the linked release's manifest gives a field of another form",
      expected: {
        fields: [
          'version',
        ],
        kind: Diagnosis.ManifestMalformed,
        manifest,
      },
      health: Health.Broken,
      release: {
        fields: [
          'version',
        ],
        manifest,
        status: ReleaseStatus.ManifestMalformed,
      },
    },
    {
      condition: 'the linked release is another than the executable',
      expected: {
        executable,
        kind: Diagnosis.LinkDiffers,
        link: {
          linkPath: linkFolder,
          targetPath: linkFolder,
        },
        release: older,
      },
      health: Health.Warned,
      release: {
        status: ReleaseStatus.Installed,
        version: older,
      },
    },
    {
      condition: 'the linked release is the executable',
      expected: {
        kind: Diagnosis.LinkMatches,
        link: {
          linkPath: linkFolder,
          targetPath: linkFolder,
        },
      },
      health: Health.Sound,
      release: {
        status: ReleaseStatus.Installed,
        version: executable,
      },
    },
  ])(
    'should diagnose $expected.kind, $health, when $condition',
    ({ expected, health, release }) => {
      // Arrange
      const given = {
        executable,
        linked: {
          place,
          realFolderPath: undefined,
          release,
        },
      };

      // Act
      const reading = readingOf(PartDiagnosis.ofLink(given));

      // Assert
      expect(reading).toStrictEqual({
        diagnosis: expected,
        health,
      });
    },
  );

  it.each([
    {
      condition: 'the link resolves outside the project',
      realFolderPath: AbsolutePath.create('/releases/1.0.0'),
      target: AbsolutePath.create('/releases/1.0.0'),
    },
    {
      condition: 'the link resolves in the project',
      realFolderPath: AbsolutePath.create(`${PROJECT}/packages/constitution`),
      target: RepositoryRelativePath.create('packages/constitution'),
    },
  ])(
    'should give the link and the folder it resolves to, from the project, when $condition',
    ({ realFolderPath, target }) => {
      // Arrange
      const given = {
        executable,
        linked: {
          place,
          realFolderPath,
          release: {
            status: ReleaseStatus.Installed,
            version: executable,
          },
        },
      } as const;

      // Act
      const diagnosis = PartDiagnosis.ofLink(given);

      // Assert
      expect(diagnosis).toStrictEqual({
        kind: Diagnosis.LinkMatches,
        link: {
          linkPath: linkFolder,
          targetPath: target,
        },
      });
    },
  );

  it('should skip the link when no project lies around the start', () => {
    // Arrange
    const given = {
      executable,
      linked: undefined,
    };

    // Act
    const reading = readingOf(PartDiagnosis.ofLink(given));

    // Assert
    expect(reading).toStrictEqual({
      diagnosis: {
        kind: Diagnosis.LinkWithoutProject,
      },
      health: Health.Skipped,
    });
  });
});

describe('PartDiagnosis.ofHooks', () => {
  it.each<{
    expected: PartDiagnosis;
    health: Health;
    state: HooksState | undefined;
  }>([
    {
      expected: {
        kind: Diagnosis.HooksWithoutProject,
      },
      health: Health.Skipped,
      state: undefined,
    },
    {
      expected: {
        kind: Diagnosis.HooksInstalled,
      },
      health: Health.Sound,
      state: HooksState.Installed,
    },
    {
      expected: {
        kind: Diagnosis.HooksMissing,
      },
      health: Health.Warned,
      state: HooksState.Missing,
    },
    {
      expected: {
        kind: Diagnosis.HooksUnavailable,
      },
      health: Health.Warned,
      state: HooksState.Unavailable,
    },
    {
      expected: {
        kind: Diagnosis.HooksUnconfigured,
      },
      health: Health.Skipped,
      state: HooksState.Unconfigured,
    },
  ])(
    'should diagnose $expected.kind, $health, when the hooks are $state',
    ({ expected, health, state }) => {
      // Act
      const reading = readingOf(PartDiagnosis.ofHooks(state));

      // Assert
      expect(reading).toStrictEqual({
        diagnosis: expected,
        health,
      });
    },
  );
});
