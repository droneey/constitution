import { describe, expect, it } from 'bun:test';

import { StepStatus, Tone } from '@droneey/design-cli';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { notesTextOf } from '#/__tests__/notes-text.fixtures';
import { RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';
import { noteSection } from '#/shared/cli';

import type { ApplyPlan, ApplyReport, SettingPlace } from '../../../domain/apply-plan/entities';
import { ApplyPlanKind } from '../../../domain/apply-plan/entities';
import { ProjectRead, ProjectReadStatus } from '../../../domain/presets-project/entities';
import type { PresetsFinding } from '../../../domain/shared/entities';
import { PresetsCode } from '../../../domain/shared/entities';
import { placeMessage } from '../apply-report.messages';
import { applyOutcomeOf, applySectionsOf } from '../apply-report.utils';
import { findingLinesOf } from '../finding-lines.utils';

const lockUnparsed: PresetsFinding = {
  code: PresetsCode.LockUnparsed,
  details: {},
  path: 'constitution.lock',
};
const loosened: PresetsFinding = {
  code: PresetsCode.Loosened,
  details: {
    settingPath: 'formatter.width',
    wanted: '100',
  },
  path: 'biome.json',
};
const added: SettingPlace = {
  filePath: RepositoryRelativePath.create('biome.json'),
  settingPath: 'test.randomize',
};
const removedFromBiome: SettingPlace = {
  filePath: RepositoryRelativePath.create('biome.json'),
  settingPath: 'files "dist"',
};
const removedFromIgnore: SettingPlace = {
  filePath: RepositoryRelativePath.create('.gitignore'),
  settingPath: '"dist/"',
};

const quietReport: ApplyReport = {
  defaultsAddedToExistingFiles: [],
  deletedFilePaths: [],
  removedByApply: [],
  writtenUnitPaths: [],
  writtenFilePaths: [],
};
const writtenReport: ApplyReport = {
  ...quietReport,
  writtenUnitPaths: [
    UnitPath.create(''),
  ],
  writtenFilePaths: [
    RepositoryRelativePath.create('biome.json'),
  ],
};
const fullReport: ApplyReport = {
  defaultsAddedToExistingFiles: [
    added,
  ],
  deletedFilePaths: [
    RepositoryRelativePath.create('notes.json'),
  ],
  removedByApply: [
    removedFromBiome,
    removedFromIgnore,
  ],
  writtenUnitPaths: [
    UnitPath.create(''),
  ],
  writtenFilePaths: [
    RepositoryRelativePath.create('biome.json'),
    RepositoryRelativePath.create('constitution.lock'),
  ],
};

const readyOf = (report: ApplyReport, notes: readonly PresetsFinding[] = []): ApplyPlan => ({
  changes: {
    deletedFilePaths: [],
    files: [],
    locks: [],
  },
  kind: ApplyPlanKind.Ready,
  notes,
  report,
});

const quiet = readyOf(quietReport);
const written = readyOf(writtenReport);
const full = readyOf(fullReport);
const noted = readyOf(writtenReport, [
  lockUnparsed,
]);
const found: ApplyPlan = {
  findings: [
    loosened,
  ],
  kind: ApplyPlanKind.Held,
};

const noProject: ProjectRead<never> = {
  status: ProjectReadStatus.NoProject,
};

describe('applyOutcomeOf and applySectionsOf', () => {
  it('should word the step and the report as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'outcome when found': applyOutcomeOf(ProjectRead.opened(found)).detail,
      'outcome when no project': applyOutcomeOf(noProject).detail,
      'outcome when written': applyOutcomeOf(ProjectRead.opened(written)).detail,
      sections: notesTextOf(applySectionsOf(ProjectRead.opened(full))),
      'sections when found': notesTextOf(applySectionsOf(ProjectRead.opened(found))),
      'sections when noted': notesTextOf(applySectionsOf(ProjectRead.opened(noted))),
    });

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('apply-report.golden.txt', import.meta.url), golden),
    );
  });
});

describe('applyOutcomeOf', () => {
  it.each<{
    condition: string;
    report: ProjectRead<ApplyPlan>;
    status: StepStatus;
  }>([
    {
      condition: 'no project lies around the folder',
      report: noProject,
      status: StepStatus.Failed,
    },
    {
      condition: 'it wrote a file and found nothing wrong',
      report: ProjectRead.opened(written),
      status: StepStatus.Done,
    },
    {
      condition: 'it wrote a file and noted what it wrote despite',
      report: ProjectRead.opened(noted),
      status: StepStatus.Done,
    },
    {
      condition: 'it found something wrong',
      report: ProjectRead.opened(found),
      status: StepStatus.Failed,
    },
  ])('should end the step as $status when $condition', ({ report, status }) => {
    // Act
    const outcome = applyOutcomeOf(report);

    // Assert
    expect(outcome.status).toBe(status);
  });
});

describe('applySectionsOf', () => {
  it('should give what it wrote, deleted, removed and added when it found nothing wrong', () => {
    // Act
    const sections = applySectionsOf(ProjectRead.opened(full));

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: [
          'biome.json',
          'constitution.lock',
        ],
        title: expect.any(String),
        tone: Tone.Info,
      }),
      noteSection({
        lines: [
          'notes.json',
        ],
        title: expect.any(String),
        tone: Tone.Info,
      }),
      noteSection({
        lines: [
          placeMessage(removedFromBiome),
          placeMessage(removedFromIgnore),
        ],
        title: expect.any(String),
        tone: Tone.Info,
      }),
      noteSection({
        lines: [
          placeMessage(added),
        ],
        title: expect.any(String),
        tone: Tone.Info,
      }),
    ]);
  });

  it('should give what it noted before what it wrote', () => {
    // Act
    const sections = applySectionsOf(ProjectRead.opened(noted));

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: findingLinesOf([
          lockUnparsed,
        ]),
        title: expect.any(String),
        tone: Tone.Warning,
      }),
      noteSection({
        lines: [
          'biome.json',
        ],
        title: expect.any(String),
        tone: Tone.Info,
      }),
    ]);
  });

  it('should give only the findings when it found something wrong, as it wrote nothing', () => {
    // Act
    const sections = applySectionsOf(ProjectRead.opened(found));

    // Assert
    expect(sections).toStrictEqual([
      noteSection({
        lines: findingLinesOf([
          loosened,
        ]),
        title: expect.any(String),
        tone: Tone.Error,
      }),
    ]);
  });

  it.each([
    {
      condition: 'no project lies around the folder',
      report: noProject,
    },
    {
      condition: 'it changed nothing and found nothing',
      report: ProjectRead.opened(quiet),
    },
  ])('should give nothing when $condition', ({ report }) => {
    // Act
    const sections = applySectionsOf(report);

    // Assert
    expect(sections).toStrictEqual([]);
  });
});
