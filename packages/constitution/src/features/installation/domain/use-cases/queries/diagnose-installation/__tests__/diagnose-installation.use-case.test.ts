import { describe, expect, it } from 'bun:test';

import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { ProjectPlace, Release } from '#/kernel/entities';
import { ReleaseStatus } from '#/kernel/entities';
import { AbsolutePath, RepositoryRelativePath, Version } from '#/kernel/value-objects';

import type { InstalledPlugin, LatestRelease } from '../../../../entities';
import {
  Diagnosis,
  Health,
  HooksState,
  InstallationPart,
  PartDiagnosis,
  ReleaseLookup,
} from '../../../../entities';
import type { DiagnoseInstallationPorts } from '../diagnose-installation.use-case';
import { diagnoseInstallation } from '../diagnose-installation.use-case';

const FINGERPRINT = 'f1';
const onPath = AbsolutePath.create('/home/me/.local/bin/constitution');
const EXECUTABLE_NAME = 'constitution';
const linkFolder = RepositoryRelativePath.create('.droneey/constitution');

const executable = Version.create('1.0.0');
const older = Version.create('0.9.0');
const manifest = AbsolutePath.create(`${releaseFolderPath}/package.json`);
// A project linked to a release of this executable's version.
const TREE: FakeTree = {
  files: {
    [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
    [`${PROJECT}/constitution.yaml`]: 'domains: []\n',
    [manifest]: '{}\n',
  },
} as const;

interface Installation {
  // the version the executable on PATH answers to --version
  readonly answered?: string | undefined;
  // the fingerprint of the plugin's files this executable was built with
  readonly fingerprint?: string | undefined;
  readonly hooks?: HooksState;
  readonly isOnPath?: boolean;
  readonly latest?: LatestRelease;
  readonly plugin?: InstalledPlugin | undefined;
  // the release the project pins, or the failure its read throws
  readonly release?: Release | Error;
  readonly tree?: FakeTree;
}

// A sound installation by default: one release everywhere, the hooks installed.
const portsOf = (installation: Installation = {}): DiagnoseInstallationPorts => ({
  files: createFakeProjectFiles(installation.tree ?? TREE),
  hooks: {
    stateOf: (): HooksState => installation.hooks ?? HooksState.Installed,
  },
  path: {
    // PATH holds the executable under its own name only
    find: (name: string): AbsolutePath | undefined =>
      installation.isOnPath === false || name !== EXECUTABLE_NAME ? undefined : onPath,
    versionOf: (): string | undefined =>
      'answered' in installation ? installation.answered : executable,
  },
  plugins: {
    installed: (): InstalledPlugin | undefined =>
      'plugin' in installation
        ? installation.plugin
        : {
            fingerprint: FINGERPRINT,
            version: executable,
          },
  },
  releases: {
    latest: async (): Promise<LatestRelease> =>
      await Promise.resolve(
        installation.latest ?? {
          lookup: ReleaseLookup.Found,
          version: executable,
        },
      ),
  },
  pinned: {
    // the project holds its own folder and every folder below it
    find: (startFolderPath: AbsolutePath): ProjectPlace | undefined =>
      startFolderPath === PROJECT || startFolderPath.startsWith(`${PROJECT}/`)
        ? projectPlace
        : undefined,
    readRelease: (): Release => {
      const { release } = installation;

      if (release instanceof Error) {
        throw release;
      }

      return (
        release ?? {
          status: ReleaseStatus.Installed,
          version: executable,
        }
      );
    },
  },
});

const diagnosesOf = async (
  input: { installation?: Installation; start?: AbsolutePath } = {},
): Promise<readonly PartDiagnosis[]> => {
  const installation = input.installation ?? {};

  return await diagnoseInstallation({
    ...portsOf(installation),
    executable,
    fingerprint: 'fingerprint' in installation ? installation.fingerprint : FINGERPRINT,
    startFolderPath: input.start ?? AbsolutePath.create(PROJECT),
  });
};

const diagnosisOf = async (input: {
  installation?: Installation;
  part: InstallationPart;
  start?: AbsolutePath;
}): Promise<PartDiagnosis | undefined> =>
  (await diagnosesOf(input)).find((found) => PartDiagnosis.partOf(found) === input.part);

interface Reading {
  readonly diagnosis: PartDiagnosis | undefined;
  readonly health: Health | undefined;
}

const readingOf = async (input: {
  installation?: Installation;
  part: InstallationPart;
  start?: AbsolutePath;
}): Promise<Reading> => {
  const diagnosis = await diagnosisOf(input);

  return {
    diagnosis,
    health: diagnosis === undefined ? undefined : PartDiagnosis.healthOf(diagnosis),
  };
};

describe('diagnoseInstallation', () => {
  it.each<{
    expected: PartDiagnosis;
    part: InstallationPart;
  }>([
    {
      expected: {
        executable,
        kind: Diagnosis.ExecutableRuns,
      },
      part: InstallationPart.Executable,
    },
    {
      expected: {
        executable,
        kind: Diagnosis.PluginMatches,
        plugin: executable,
      },
      part: InstallationPart.Plugin,
    },
    {
      expected: {
        kind: Diagnosis.LatestHeld,
        latest: executable,
      },
      part: InstallationPart.Release,
    },
    {
      expected: {
        kind: Diagnosis.PathMatches,
        path: onPath,
      },
      part: InstallationPart.Path,
    },
    {
      expected: {
        kind: Diagnosis.LinkMatches,
        link: {
          linkPath: linkFolder,
          targetPath: linkFolder,
        },
      },
      part: InstallationPart.Link,
    },
    {
      expected: {
        kind: Diagnosis.HooksInstalled,
      },
      part: InstallationPart.Hooks,
    },
  ])(
    'should find the $part sound, with what it found, when one release serves them all',
    async ({ expected, part }) => {
      // Arrange
      const asked = {
        part,
      };

      // Act
      const reading = await readingOf(asked);

      // Assert
      expect(reading).toStrictEqual({
        diagnosis: expected,
        health: Health.Sound,
      });
    },
  );

  it('should diagnose every part, in order', async () => {
    // Arrange
    const asked = {
      start: AbsolutePath.create(PROJECT),
    };

    // Act
    const diagnoses = await diagnosesOf(asked);

    // Assert
    expect(diagnoses.map(PartDiagnosis.partOf)).toStrictEqual([
      InstallationPart.Executable,
      InstallationPart.Plugin,
      InstallationPart.Release,
      InstallationPart.Path,
      InstallationPart.Link,
      InstallationPart.Hooks,
    ]);
  });

  it.each<{
    condition: string;
    expected: PartDiagnosis;
    health: Health;
    installation: Installation;
  }>([
    {
      condition: 'the plugin is not installed',
      expected: {
        kind: Diagnosis.PluginMissing,
      },
      health: Health.Warned,
      installation: {
        plugin: undefined,
      },
    },
    {
      condition: 'the plugin is older than the executable and its files differ',
      expected: {
        executable,
        kind: Diagnosis.PluginOlder,
        plugin: older,
      },
      health: Health.Warned,
      installation: {
        plugin: {
          fingerprint: 'f0',
          version: older,
        },
      },
    },
    {
      condition: 'the plugin is newer than the executable and its files differ',
      expected: {
        executable,
        kind: Diagnosis.PluginNewer,
        plugin: Version.create('1.0.1'),
      },
      health: Health.Warned,
      installation: {
        plugin: {
          fingerprint: 'f2',
          version: Version.create('1.0.1'),
        },
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
      installation: {
        plugin: {
          fingerprint: FINGERPRINT,
          version: older,
        },
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
      installation: {
        plugin: {
          fingerprint: 'f0',
          version: executable,
        },
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
      installation: {},
    },
    {
      condition: "neither the plugin's files nor the executable's can be read",
      expected: {
        executable,
        kind: Diagnosis.PluginDiffersAtItsVersion,
      },
      health: Health.Warned,
      installation: {
        fingerprint: undefined,
        plugin: {
          version: executable,
        },
      },
    },
    {
      condition: "the plugin's files cannot be read",
      expected: {
        executable,
        kind: Diagnosis.PluginDiffersAtItsVersion,
      },
      health: Health.Warned,
      installation: {
        plugin: {
          version: executable,
        },
      },
    },
    {
      condition: 'a newer release is out',
      expected: {
        executable,
        kind: Diagnosis.LatestAhead,
        latest: Version.create('1.1.0'),
      },
      health: Health.Warned,
      installation: {
        latest: {
          lookup: ReleaseLookup.Found,
          version: Version.create('1.1.0'),
        },
      },
    },
    {
      condition: 'the executable is ahead of the latest release',
      expected: {
        kind: Diagnosis.LatestHeld,
        latest: Version.create('0.9.9'),
      },
      health: Health.Sound,
      installation: {
        latest: {
          lookup: ReleaseLookup.Found,
          version: Version.create('0.9.9'),
        },
      },
    },
    {
      condition: 'GitHub cannot be reached',
      expected: {
        kind: Diagnosis.LatestUnanswered,
        reason: 'fetch failed',
      },
      health: Health.Skipped,
      installation: {
        latest: {
          lookup: ReleaseLookup.Unanswered,
          reason: 'fetch failed',
        },
      },
    },
    {
      condition: 'GitHub refuses the call',
      expected: {
        kind: Diagnosis.LatestRefused,
        status: 403,
      },
      health: Health.Skipped,
      installation: {
        latest: {
          lookup: ReleaseLookup.Refused,
          status: 403,
        },
      },
    },
    {
      condition: "GitHub's answer names no release",
      expected: {
        kind: Diagnosis.LatestUnreadable,
      },
      health: Health.Skipped,
      installation: {
        latest: {
          lookup: ReleaseLookup.Unreadable,
        },
      },
    },
    {
      condition: 'the executable is not on PATH',
      expected: {
        kind: Diagnosis.ExecutableNotOnPath,
      },
      health: Health.Broken,
      installation: {
        isOnPath: false,
      },
    },
    {
      condition: 'the executable on PATH is another release',
      expected: {
        answered: '0.9.0',
        executable,
        kind: Diagnosis.PathDiffers,
        path: onPath,
      },
      health: Health.Warned,
      installation: {
        answered: '0.9.0',
      },
    },
    {
      condition: 'the executable on PATH names no version',
      expected: {
        kind: Diagnosis.PathSilent,
        path: onPath,
      },
      health: Health.Warned,
      installation: {
        answered: undefined,
      },
    },
    {
      condition: 'no release is linked',
      expected: {
        kind: Diagnosis.ReleaseMissing,
        releaseFolderPath: projectPlace.releaseFolderPath,
      },
      health: Health.Broken,
      installation: {
        release: {
          status: ReleaseStatus.Missing,
        },
      },
    },
    {
      condition: 'the linked release is of a newer block format',
      expected: {
        format: 9,
        kind: Diagnosis.ReleaseFormatNewer,
      },
      health: Health.Broken,
      installation: {
        release: {
          format: 9,
          status: ReleaseStatus.Newer,
        },
      },
    },
    {
      condition: 'the linked release is of an older block format',
      expected: {
        kind: Diagnosis.ReleaseFormatOlder,
      },
      health: Health.Broken,
      installation: {
        release: {
          status: ReleaseStatus.Older,
        },
      },
    },
    {
      condition: 'the linked release names no version',
      expected: {
        kind: Diagnosis.ManifestWithoutVersion,
        manifest,
      },
      health: Health.Broken,
      installation: {
        release: {
          manifest,
          status: ReleaseStatus.VersionMissing,
        },
      },
    },
    {
      condition: "the linked release's manifest cannot be read",
      expected: {
        kind: Diagnosis.ManifestUnreadable,
        manifest,
      },
      health: Health.Broken,
      installation: {
        release: {
          manifest,
          status: ReleaseStatus.ManifestUnreadable,
        },
      },
    },
    {
      condition: "the linked release's manifest is no JSON object",
      expected: {
        kind: Diagnosis.ManifestNotObject,
        manifest,
      },
      health: Health.Broken,
      installation: {
        release: {
          manifest,
          status: ReleaseStatus.ManifestNotObject,
        },
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
      installation: {
        release: {
          fields: [
            'version',
          ],
          manifest,
          status: ReleaseStatus.ManifestMalformed,
        },
      },
    },
    {
      condition: 'the linked release is another than the executable',
      expected: {
        kind: Diagnosis.LinkDiffers,
        link: {
          linkPath: linkFolder,
          targetPath: linkFolder,
        },
        executable,
        release: older,
      },
      health: Health.Warned,
      installation: {
        release: {
          status: ReleaseStatus.Installed,
          version: older,
        },
      },
    },
    {
      condition: "lefthook's hooks are not installed",
      expected: {
        kind: Diagnosis.HooksMissing,
      },
      health: Health.Warned,
      installation: {
        hooks: HooksState.Missing,
      },
    },
    {
      condition: 'lefthook is not on PATH',
      expected: {
        kind: Diagnosis.HooksUnavailable,
      },
      health: Health.Warned,
      installation: {
        hooks: HooksState.Unavailable,
      },
    },
    {
      condition: 'the project keeps no lefthook configuration',
      expected: {
        kind: Diagnosis.HooksUnconfigured,
      },
      health: Health.Skipped,
      installation: {
        hooks: HooksState.Unconfigured,
      },
    },
  ])(
    'should diagnose $expected.kind, $health, when $condition',
    async ({ expected, health, installation }) => {
      // Arrange
      const asked = {
        installation,
        part: PartDiagnosis.partOf(expected),
      };

      // Act
      const reading = await readingOf(asked);

      // Assert
      expect(reading).toStrictEqual({
        diagnosis: expected,
        health,
      });
    },
  );

  it.each([
    {
      kind: Diagnosis.LinkWithoutProject,
      part: InstallationPart.Link,
    },
    {
      kind: Diagnosis.HooksWithoutProject,
      part: InstallationPart.Hooks,
    },
  ])('should skip the $part when no project lies around the start', async ({ kind, part }) => {
    // Arrange
    const asked = {
      part,
      start: AbsolutePath.create('/elsewhere'),
    };

    // Act
    const reading = await readingOf(asked);

    // Assert
    expect(reading).toStrictEqual({
      diagnosis: {
        kind,
      },
      health: Health.Skipped,
    });
  });

  it.each([
    {
      condition: 'the release lies outside the project',
      release: '/releases/1.0.0',
      target: AbsolutePath.create('/releases/1.0.0'),
    },
    {
      condition: 'the release lies in the project',
      release: `${PROJECT}/packages/constitution`,
      target: RepositoryRelativePath.create('packages/constitution'),
    },
  ])(
    'should give the link and the folder it resolves to, from the project, when $condition',
    async ({ release, target }) => {
      // Arrange
      const asked = {
        installation: {
          tree: {
            files: {
              [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
              [`${PROJECT}/constitution.yaml`]: 'domains: []\n',
              [`${release}/package.json`]: '{}\n',
            },
            links: {
              [releaseFolderPath]: release,
            },
          },
        },
        part: InstallationPart.Link,
      };

      // Act
      const diagnosis = await diagnosisOf(asked);

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

  it('should let a failure of the read through', () => {
    // Arrange
    const failure = new TypeError('a defect');

    // Act
    const act = diagnosesOf({
      installation: {
        release: failure,
      },
    });

    // Assert
    expect(act).rejects.toThrow(failure);
  });
});
