import { describe, expect, it } from 'bun:test';

import type { FakeTree } from '#/__tests__/project-files.fake';
import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { createFakeProjectSource } from '#/__tests__/project-source.fake';
import type { Release } from '#/kernel/entities';
import { ReleaseStatus } from '#/kernel/entities';
import { ProjectError, ProjectFailure } from '#/kernel/errors';
import { Version } from '#/kernel/value-objects';

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
const ON_PATH = '/home/me/.local/bin/constitution';
const PROGRAM_NAME = 'constitution';
const LINK_FOLDER = '.droneey/constitution';

const program = Version.create('1.0.0');
const older = Version.create('0.9.0');
const manifest = `${releaseFolderPath}/package.json`;
// A project linked to a release of this program's version.
const TREE: FakeTree = {
  files: {
    [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
    [`${PROJECT}/constitution.yaml`]: 'domains: []\n',
    [manifest]: '{}\n',
  },
} as const;

interface Installation {
  // the version the program on PATH answers to --version
  readonly answered?: string | undefined;
  // the fingerprint of the plugin's files this program was built with
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
    // PATH holds the program under its own name only
    find: (name: string): string | undefined =>
      installation.isOnPath === false || name !== PROGRAM_NAME ? undefined : ON_PATH,
    versionOf: (): string | undefined =>
      'answered' in installation ? installation.answered : program,
  },
  plugins: {
    installed: (): InstalledPlugin | undefined =>
      'plugin' in installation
        ? installation.plugin
        : {
            fingerprint: FINGERPRINT,
            version: program,
          },
  },
  releases: {
    latest: async (): Promise<LatestRelease> =>
      await Promise.resolve(
        installation.latest ?? {
          lookup: ReleaseLookup.Found,
          version: program,
        },
      ),
  },
  source: createFakeProjectSource({
    place: projectPlace,
    release: installation.release ?? {
      status: ReleaseStatus.Installed,
      version: program,
    },
  }),
});

const diagnosesOf = async (
  input: { installation?: Installation; start?: string } = {},
): Promise<readonly PartDiagnosis[]> => {
  const installation = input.installation ?? {};

  return await diagnoseInstallation({
    ...portsOf(installation),
    fingerprint: 'fingerprint' in installation ? installation.fingerprint : FINGERPRINT,
    program,
    start: input.start ?? PROJECT,
  });
};

const diagnosisOf = async (input: {
  installation?: Installation;
  part: InstallationPart;
  start?: string;
}): Promise<PartDiagnosis | undefined> =>
  (await diagnosesOf(input)).find((found) => PartDiagnosis.partOf(found) === input.part);

interface Reading {
  readonly diagnosis: PartDiagnosis | undefined;
  readonly health: Health | undefined;
}

const readingOf = async (input: {
  installation?: Installation;
  part: InstallationPart;
  start?: string;
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
        kind: Diagnosis.ProgramRuns,
        program,
      },
      part: InstallationPart.Program,
    },
    {
      expected: {
        kind: Diagnosis.PluginMatches,
        plugin: program,
        program,
      },
      part: InstallationPart.Plugin,
    },
    {
      expected: {
        kind: Diagnosis.LatestHeld,
        latest: program,
      },
      part: InstallationPart.Release,
    },
    {
      expected: {
        kind: Diagnosis.PathMatches,
        path: ON_PATH,
      },
      part: InstallationPart.Path,
    },
    {
      expected: {
        kind: Diagnosis.LinkMatches,
        link: {
          folder: LINK_FOLDER,
          target: LINK_FOLDER,
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
      start: PROJECT,
    };

    // Act
    const diagnoses = await diagnosesOf(asked);

    // Assert
    expect(diagnoses.map(PartDiagnosis.partOf)).toStrictEqual([
      InstallationPart.Program,
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
      condition: 'the plugin is older than the program and its files differ',
      expected: {
        kind: Diagnosis.PluginOlder,
        plugin: older,
        program,
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
      condition: 'the plugin is newer than the program and its files differ',
      expected: {
        kind: Diagnosis.PluginNewer,
        plugin: Version.create('1.0.1'),
        program,
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
      condition: "the plugin is another release whose files are the program's",
      expected: {
        kind: Diagnosis.PluginMatches,
        plugin: older,
        program,
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
        "the plugin's files differ from the program's at one version, as a working tree's do",
      expected: {
        kind: Diagnosis.PluginDiffersAtItsVersion,
        program,
      },
      health: Health.Warned,
      installation: {
        plugin: {
          fingerprint: 'f0',
          version: program,
        },
      },
    },
    {
      condition: "the plugin is this program's release with its files",
      expected: {
        kind: Diagnosis.PluginMatches,
        plugin: program,
        program,
      },
      health: Health.Sound,
      installation: {},
    },
    {
      condition: "neither the plugin's files nor the program's can be read",
      expected: {
        kind: Diagnosis.PluginDiffersAtItsVersion,
        program,
      },
      health: Health.Warned,
      installation: {
        fingerprint: undefined,
        plugin: {
          version: program,
        },
      },
    },
    {
      condition: "the plugin's files cannot be read",
      expected: {
        kind: Diagnosis.PluginDiffersAtItsVersion,
        program,
      },
      health: Health.Warned,
      installation: {
        plugin: {
          version: program,
        },
      },
    },
    {
      condition: 'a newer release is out',
      expected: {
        kind: Diagnosis.LatestAhead,
        latest: Version.create('1.1.0'),
        program,
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
      condition: 'the program is ahead of the latest release',
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
        kind: Diagnosis.LatestUnknown,
      },
      health: Health.Skipped,
      installation: {
        latest: {
          cause: new TypeError('fetch failed'),
          lookup: ReleaseLookup.Unreachable,
        },
      },
    },
    {
      condition: 'the program is not on PATH',
      expected: {
        kind: Diagnosis.ProgramNotOnPath,
      },
      health: Health.Broken,
      installation: {
        isOnPath: false,
      },
    },
    {
      condition: 'the program on PATH is another release',
      expected: {
        answered: '0.9.0',
        kind: Diagnosis.PathDiffers,
        path: ON_PATH,
        program,
      },
      health: Health.Warned,
      installation: {
        answered: '0.9.0',
      },
    },
    {
      condition: 'the program on PATH names no version',
      expected: {
        kind: Diagnosis.PathSilent,
        path: ON_PATH,
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
        releaseFolder: releaseFolderPath,
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
        release: new ProjectError({
          code: ProjectFailure.VersionMissing,
          details: {
            path: manifest,
          },
        }),
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
        release: new ProjectError({
          code: ProjectFailure.ManifestUnreadable,
          details: {
            path: manifest,
          },
        }),
      },
    },
    {
      condition: 'the linked release is another than the program',
      expected: {
        kind: Diagnosis.LinkDiffers,
        link: {
          folder: LINK_FOLDER,
          target: LINK_FOLDER,
        },
        program,
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
      start: '/elsewhere',
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
      target: '/releases/1.0.0',
    },
    {
      condition: 'the release lies in the project',
      release: `${PROJECT}/packages/constitution`,
      target: 'packages/constitution',
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
          folder: LINK_FOLDER,
          target,
        },
      });
    },
  );

  it('should let a failure it does not recognise through when the release cannot be read', () => {
    // Arrange
    const installation = {
      release: new TypeError('a defect'),
    };

    // Act
    const act = diagnosesOf({
      installation,
    });

    // Assert
    expect(act).rejects.toThrow(new TypeError('a defect'));
  });
});
