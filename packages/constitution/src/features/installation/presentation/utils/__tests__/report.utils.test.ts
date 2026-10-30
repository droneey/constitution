import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { AbsolutePath, RepositoryRelativePath, Version } from '#/kernel/value-objects';
import { noteSection, stepsSection } from '#/shared/cli';

import type { PartDiagnosis } from '../../../domain/part-diagnosis/entities';
import { Diagnosis } from '../../../domain/part-diagnosis/entities';
import { installationOutcomeOf, installationSectionsOf } from '../report.utils';

const onPath = AbsolutePath.create('/home/me/.local/bin/constitution');
const MANIFEST = '/work/project/.droneey/constitution/package.json';
const manifest = AbsolutePath.create(MANIFEST);
const RELEASE_FOLDER_PATH = '/work/project/.droneey/constitution';
const MISE_INSTALL = 'run mise install';
const RAISE_PIN = 'raise the Constitution pin in mise.toml, then run mise install';
const UPDATE_PLUGIN =
  'run claude plugin marketplace update droneey, then claude plugin update constitution@droneey';
const NO_PROJECT = 'no constitution.yaml in this folder or above it';

const executable = Version.create('1.0.0');
const older = Version.create('0.9.0');
const newer = Version.create('1.1.0');
const LINK = {
  linkPath: RepositoryRelativePath.create('.droneey/constitution'),
  targetPath: AbsolutePath.create('/releases/1.0.0'),
} as const;

const SOUND: PartDiagnosis = {
  executable,
  kind: Diagnosis.ExecutableRuns,
} as const;
const WARNED: PartDiagnosis = {
  kind: Diagnosis.HooksMissing,
} as const;
const BROKEN: PartDiagnosis = {
  kind: Diagnosis.ReleaseMissing,
  releaseFolderPath: AbsolutePath.create(RELEASE_FOLDER_PATH),
} as const;
const SKIPPED: PartDiagnosis = {
  kind: Diagnosis.LatestUnreadable,
} as const;

describe('installationOutcomeOf', () => {
  it.each([
    {
      condition: 'every part is sound or skipped',
      diagnoses: [
        SOUND,
        SKIPPED,
      ],
      outcome: {
        detail: 'every part is sound',
        status: StepStatus.Done,
      },
    },
    {
      condition: 'a part is worth a look',
      diagnoses: [
        SOUND,
        WARNED,
      ],
      outcome: {
        detail: '1 part to look at',
        status: StepStatus.Warned,
      },
    },
    {
      condition: 'a part is broken',
      diagnoses: [
        WARNED,
        BROKEN,
      ],
      outcome: {
        detail: '2 parts to look at',
        status: StepStatus.Failed,
      },
    },
  ])('should end the step as $outcome.status when $condition', ({ diagnoses, outcome }) => {
    // Act
    const given = installationOutcomeOf(diagnoses);

    // Assert
    expect(given).toStrictEqual(outcome);
  });
});

describe('installationSectionsOf', () => {
  it('should list every part by its health, then what to do about each that is not sound', () => {
    // Arrange
    const diagnoses = [
      SOUND,
      SKIPPED,
      WARNED,
      BROKEN,
    ];

    // Act
    const sections = installationSectionsOf(diagnoses);

    // Assert
    expect(sections).toStrictEqual([
      stepsSection([
        {
          detail: 'constitution 1.0.0',
          label: 'Executable',
          status: StepStatus.Done,
        },
        {
          detail: "GitHub's answer names no release, so the latest release is unknown",
          label: 'Latest release',
          status: StepStatus.Skipped,
        },
        {
          detail: "lefthook's hooks are not installed",
          label: 'Git hooks',
          status: StepStatus.Warned,
        },
        {
          detail: `${RELEASE_FOLDER_PATH} does not exist`,
          label: 'Release link',
          status: StepStatus.Failed,
        },
      ]),
      noteSection({
        lines: [
          'Git hooks: run lefthook install',
          'Release link: run mise install, which installs the release mise.toml pins and links it there',
        ],
        title: 'What to do',
        tone: Tone.Info,
      }),
    ]);
  });

  it('should name every part and give no hint when all are sound', () => {
    // Arrange
    const diagnoses: readonly PartDiagnosis[] = [
      SOUND,
      {
        executable,
        kind: Diagnosis.PluginMatches,
        plugin: executable,
      },
      {
        kind: Diagnosis.PathMatches,
        path: onPath,
      },
    ];

    // Act
    const sections = installationSectionsOf(diagnoses);

    // Assert
    expect(sections).toStrictEqual([
      stepsSection([
        {
          detail: 'constitution 1.0.0',
          label: 'Executable',
          status: StepStatus.Done,
        },
        {
          detail: '1.0.0',
          label: 'Claude Code plugin',
          status: StepStatus.Done,
        },
        {
          detail: onPath,
          label: 'constitution on PATH',
          status: StepStatus.Done,
        },
      ]),
    ]);
  });

  it.each<{
    detail: string;
    diagnosis: PartDiagnosis;
    label: string;
    status: StepStatus;
  }>([
    {
      detail: 'constitution 1.0.0',
      diagnosis: SOUND,
      label: 'Executable',
      status: StepStatus.Done,
    },
    {
      detail: '0.9.0, whose files are those of this executable 1.0.0',
      diagnosis: {
        executable,
        kind: Diagnosis.PluginMatches,
        plugin: older,
      },
      label: 'Claude Code plugin',
      status: StepStatus.Done,
    },
    {
      detail: 'GitHub could not be reached, so the latest release is unknown: fetch failed',
      diagnosis: {
        kind: Diagnosis.LatestUnanswered,
        reason: 'fetch failed',
      },
      label: 'Latest release',
      status: StepStatus.Skipped,
    },
    {
      detail: 'GitHub refused the call with status 403, so the latest release is unknown',
      diagnosis: {
        kind: Diagnosis.LatestRefused,
        status: 403,
      },
      label: 'Latest release',
      status: StepStatus.Skipped,
    },
    {
      detail: "GitHub's answer names no release, so the latest release is unknown",
      diagnosis: SKIPPED,
      label: 'Latest release',
      status: StepStatus.Skipped,
    },
    {
      detail: '0.9.0 is the latest',
      diagnosis: {
        kind: Diagnosis.LatestHeld,
        latest: older,
      },
      label: 'Latest release',
      status: StepStatus.Done,
    },
    {
      detail: onPath,
      diagnosis: {
        kind: Diagnosis.PathMatches,
        path: onPath,
      },
      label: 'constitution on PATH',
      status: StepStatus.Done,
    },
    {
      detail: NO_PROJECT,
      diagnosis: {
        kind: Diagnosis.LinkWithoutProject,
      },
      label: 'Release link',
      status: StepStatus.Skipped,
    },
    {
      detail: '.droneey/constitution → /releases/1.0.0',
      diagnosis: {
        kind: Diagnosis.LinkMatches,
        link: LINK,
      },
      label: 'Release link',
      status: StepStatus.Done,
    },
    {
      detail: NO_PROJECT,
      diagnosis: {
        kind: Diagnosis.HooksWithoutProject,
      },
      label: 'Git hooks',
      status: StepStatus.Skipped,
    },
    {
      detail: "lefthook's hooks are installed",
      diagnosis: {
        kind: Diagnosis.HooksInstalled,
      },
      label: 'Git hooks',
      status: StepStatus.Done,
    },
    {
      detail: 'the project keeps no lefthook configuration',
      diagnosis: {
        kind: Diagnosis.HooksUnconfigured,
      },
      label: 'Git hooks',
      status: StepStatus.Skipped,
    },
  ])(
    'should say what doctor found, and give no hint, when the $label is $diagnosis.kind',
    ({ detail, diagnosis, label, status }) => {
      // Arrange
      const diagnoses = [
        diagnosis,
      ];

      // Act
      const sections = installationSectionsOf(diagnoses);

      // Assert
      expect(sections).toStrictEqual([
        stepsSection([
          {
            detail,
            label,
            status,
          },
        ]),
      ]);
    },
  );

  it.each<{
    detail: string;
    diagnosis: PartDiagnosis;
    hint: string;
    label: string;
    status: StepStatus;
  }>([
    {
      detail: 'the Claude Code plugin is not installed',
      diagnosis: {
        kind: Diagnosis.PluginMissing,
      },
      hint: 'run claude plugin marketplace add droneey/constitution, then claude plugin install constitution@droneey',
      label: 'Claude Code plugin',
      status: StepStatus.Warned,
    },
    {
      detail: "the plugin's files differ from constitution's, both 1.0.0",
      diagnosis: {
        executable,
        kind: Diagnosis.PluginDiffersAtItsVersion,
      },
      hint: 'install the plugin from the tree constitution runs from, whose plugin files changed since that release',
      label: 'Claude Code plugin',
      status: StepStatus.Warned,
    },
    {
      detail: 'the plugin 0.9.0 is older than this executable 1.0.0, and its files differ',
      diagnosis: {
        executable,
        kind: Diagnosis.PluginOlder,
        plugin: older,
      },
      hint: UPDATE_PLUGIN,
      label: 'Claude Code plugin',
      status: StepStatus.Warned,
    },
    {
      detail: 'the plugin 1.1.0 is newer than this executable 1.0.0, and its files differ',
      diagnosis: {
        executable,
        kind: Diagnosis.PluginNewer,
        plugin: newer,
      },
      hint: RAISE_PIN,
      label: 'Claude Code plugin',
      status: StepStatus.Warned,
    },
    {
      detail: '1.1.0 is out; this executable is 1.0.0',
      diagnosis: {
        executable,
        kind: Diagnosis.LatestAhead,
        latest: newer,
      },
      hint: RAISE_PIN,
      label: 'Latest release',
      status: StepStatus.Warned,
    },
    {
      detail: 'constitution is not on PATH, so the hooks cannot run',
      diagnosis: {
        kind: Diagnosis.ExecutableNotOnPath,
      },
      hint: 'pin github:droneey/constitution in mise.toml as the README shows, then run mise install',
      label: 'constitution on PATH',
      status: StepStatus.Failed,
    },
    {
      detail: `${onPath} does not answer --version`,
      diagnosis: {
        kind: Diagnosis.PathSilent,
        path: onPath,
      },
      hint: `${MISE_INSTALL}, so PATH serves the release the project pins`,
      label: 'constitution on PATH',
      status: StepStatus.Warned,
    },
    {
      detail: `${onPath} is 0.9.0, this executable 1.0.0`,
      diagnosis: {
        answered: '0.9.0',
        executable,
        kind: Diagnosis.PathDiffers,
        path: onPath,
      },
      hint: `${MISE_INSTALL}, so PATH serves the release the project pins`,
      label: 'constitution on PATH',
      status: StepStatus.Warned,
    },
    {
      detail: `cannot read ${MANIFEST}`,
      diagnosis: {
        kind: Diagnosis.ManifestUnreadable,
        manifest,
      },
      hint: MISE_INSTALL,
      label: 'Release link',
      status: StepStatus.Failed,
    },
    {
      detail: `${MANIFEST} is no manifest a release writes — it is no JSON object`,
      diagnosis: {
        kind: Diagnosis.ManifestNotObject,
        manifest,
      },
      hint: MISE_INSTALL,
      label: 'Release link',
      status: StepStatus.Failed,
    },
    {
      detail: `${MANIFEST} is no manifest a release writes — fields of another form: version, constitutionFormat`,
      diagnosis: {
        fields: [
          'version',
          'constitutionFormat',
        ],
        kind: Diagnosis.ManifestMalformed,
        manifest,
      },
      hint: MISE_INSTALL,
      label: 'Release link',
      status: StepStatus.Failed,
    },
    {
      detail: `${MANIFEST} names no version`,
      diagnosis: {
        kind: Diagnosis.ManifestWithoutVersion,
        manifest,
      },
      hint: MISE_INSTALL,
      label: 'Release link',
      status: StepStatus.Failed,
    },
    {
      detail: `${RELEASE_FOLDER_PATH} does not exist`,
      diagnosis: {
        kind: Diagnosis.ReleaseMissing,
        releaseFolderPath: AbsolutePath.create(RELEASE_FOLDER_PATH),
      },
      hint: `${MISE_INSTALL}, which installs the release mise.toml pins and links it there`,
      label: 'Release link',
      status: StepStatus.Failed,
    },
    {
      detail: 'the release has block format 9, newer than this executable reads',
      diagnosis: {
        format: 9,
        kind: Diagnosis.ReleaseFormatNewer,
      },
      hint: UPDATE_PLUGIN,
      label: 'Release link',
      status: StepStatus.Failed,
    },
    {
      detail: 'the release is older than block format 4, the oldest this executable reads',
      diagnosis: {
        kind: Diagnosis.ReleaseFormatOlder,
      },
      hint: RAISE_PIN,
      label: 'Release link',
      status: StepStatus.Failed,
    },
    {
      detail: '.droneey/constitution → /releases/1.0.0 holds 0.9.0, this executable is 1.0.0',
      diagnosis: {
        executable,
        kind: Diagnosis.LinkDiffers,
        link: LINK,
        release: older,
      },
      hint: `${MISE_INSTALL}, so the link and this executable are one release`,
      label: 'Release link',
      status: StepStatus.Warned,
    },
    {
      detail: "lefthook's hooks are not installed",
      diagnosis: WARNED,
      hint: 'run lefthook install',
      label: 'Git hooks',
      status: StepStatus.Warned,
    },
    {
      detail: 'lefthook is not on PATH',
      diagnosis: {
        kind: Diagnosis.HooksUnavailable,
      },
      hint: 'pin lefthook in mise.toml, then run mise install',
      label: 'Git hooks',
      status: StepStatus.Warned,
    },
  ])(
    'should say what doctor found, and what to do, when the $label is $diagnosis.kind',
    ({ detail, diagnosis, hint, label, status }) => {
      // Arrange
      const diagnoses = [
        diagnosis,
      ];

      // Act
      const sections = installationSectionsOf(diagnoses);

      // Assert
      expect(sections).toStrictEqual([
        stepsSection([
          {
            detail,
            label,
            status,
          },
        ]),
        noteSection({
          lines: [
            `${label}: ${hint}`,
          ],
          title: 'What to do',
          tone: Tone.Info,
        }),
      ]);
    },
  );
});
