import { describe, expect, it } from 'bun:test';

import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { ProjectPlace, Release } from '#/kernel/entities';
import { ReleaseStatus } from '#/kernel/entities';
import { AbsolutePath, RepositoryRelativePath, Version } from '#/kernel/value-objects';

import { HooksState } from '../../../../../domain/hooks-state/entities';
import type { InstalledPlugin } from '../../../../../domain/installed-plugin/entities';
import type { LatestRelease } from '../../../../../domain/latest-release/entities';
import { ReleaseLookup } from '../../../../../domain/latest-release/entities';
import {
  Diagnosis,
  Health,
  InstallationPart,
  PartDiagnosis,
} from '../../../../../domain/part-diagnosis/entities';
import type { DiagnoseInstallationPorts } from '../diagnose-installation.use-case';
import { diagnoseInstallation } from '../diagnose-installation.use-case';

const FINGERPRINT = 'f1';
const onPath = AbsolutePath.create('/home/me/.local/bin/constitution');
const EXECUTABLE_NAME = 'constitution';
const linkFolder = RepositoryRelativePath.create('.droneey/constitution');

const executable = Version.create('1.0.0');
const manifest = AbsolutePath.create(`${releaseFolderPath}/package.json`);
const TREE: FakeTree = {
  files: {
    [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
    [`${PROJECT}/constitution.yaml`]: 'domains: []\n',
    [manifest]: '{}\n',
  },
} as const;

interface Installation {
  readonly answered?: string | undefined;
  readonly fingerprint?: string | undefined;
  readonly hooks?: HooksState;
  readonly isOnPath?: boolean;
  readonly latest?: LatestRelease;
  readonly plugin?: InstalledPlugin | undefined;
  readonly release?: Release | Error;
  readonly tree?: FakeTree;
}

const portsOf = (installation: Installation = {}): DiagnoseInstallationPorts => ({
  files: createFakeProjectFiles(installation.tree ?? TREE),
  hooks: {
    stateOf: (): HooksState => installation.hooks ?? HooksState.Installed,
  },
  path: {
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
    findProjectAround: (startFolderPath: AbsolutePath): ProjectPlace | undefined =>
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
      condition: "lefthook's hooks are not installed",
      expected: {
        kind: Diagnosis.HooksMissing,
      },
      health: Health.Warned,
      installation: {
        hooks: HooksState.Missing,
      },
    },
  ])(
    'should diagnose $expected.kind, $health, from what the ports answer when $condition',
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
