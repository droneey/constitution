import { describe, expect, it } from 'bun:test';

import { AbsolutePath, BlockId, RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import { PROJECT } from '../../../../__tests__/presets.fixtures';
import { Lock } from '../../../lock/entities';
import type { PresetsFinding } from '../../../shared/entities';
import { PresetsCode } from '../../../shared/entities';
import { ApplyPlan, ApplyPlanKind } from '../apply-plan.entity';
import type { FileChange, FileComputed } from '../file-computed.entity';
import { FileChangeKind } from '../file-computed.entity';
import type { UnitComputed } from '../unit-computed.entity';

const repositoryFolderPath = AbsolutePath.create(PROJECT);

const fileOf = (filePath: string, change: FileChange): FileComputed => ({
  change,
  defaultsAddedToExistingFile: [],
  filePath: RepositoryRelativePath.create(filePath),
  findings: [],
  missingOrOutdated: [],
  removedByApply: [],
  staleWithoutReplacement: [],
  unsorted: [],
});

const lockUnparsed: PresetsFinding = {
  code: PresetsCode.LockUnparsed,
  details: {},
  path: RepositoryRelativePath.create('constitution.lock'),
};

const toolWithoutRunner: PresetsFinding = {
  code: PresetsCode.ToolWithoutRunner,
  details: {
    block: BlockId.create('biome'),
  },
  path: RepositoryRelativePath.create('constitution.yaml'),
};

const written = fileOf('biome.json', {
  kind: FileChangeKind.Written,
  record: Lock.emptyRecord,
  text: '{}\n',
});
const deleted = fileOf('old.json', {
  kind: FileChangeKind.Deleted,
});
const kept = fileOf('kept.json', {
  kind: FileChangeKind.Kept,
  record: Lock.emptyRecord,
});

const unitOf = (path: string, files: readonly FileComputed[]): UnitComputed => ({
  files,
  findings: [],
  unitPath: UnitPath.create(path),
});

describe('ApplyPlan.of', () => {
  it('should hold the apply on a finding it neither notes nor leaves to the check', () => {
    // Arrange
    const loosened: PresetsFinding = {
      code: PresetsCode.Loosened,
      details: {
        settingPath: 'width',
        wanted: '100',
      },
      path: RepositoryRelativePath.create('biome.json'),
    };

    // Act
    const plan = ApplyPlan.of({
      files: [
        written,
      ],
      presetsFindings: [
        lockUnparsed,
        toolWithoutRunner,
        loosened,
      ],
      repositoryFolderPath,
      units: [],
    });

    // Assert
    expect(plan).toStrictEqual({
      findings: [
        loosened,
      ],
      kind: ApplyPlanKind.Held,
    });
  });

  it('should write and delete the files and locks of the units it changes, and note what it only notes', () => {
    // Arrange
    const next = {
      lock: {},
      unitFolderPath: repositoryFolderPath,
    };
    const changed: UnitComputed = {
      ...unitOf('', [
        written,
        deleted,
      ]),
      lock: {
        filePath: RepositoryRelativePath.create('constitution.lock'),
        next,
      },
    };

    // Act
    const plan = ApplyPlan.of({
      files: [
        written,
        deleted,
        kept,
      ],
      presetsFindings: [
        lockUnparsed,
        toolWithoutRunner,
      ],
      repositoryFolderPath,
      units: [
        changed,
        unitOf('packages/kit', [
          kept,
        ]),
      ],
    });

    // Assert
    expect(plan).toStrictEqual({
      changes: {
        deletedFilePaths: [
          AbsolutePath.create(`${PROJECT}/old.json`),
        ],
        files: [
          {
            filePath: AbsolutePath.create(`${PROJECT}/biome.json`),
            text: '{}\n',
          },
        ],
        locks: [
          next,
        ],
      },
      kind: ApplyPlanKind.Ready,
      notes: [
        lockUnparsed,
      ],
      report: {
        defaultsAddedToExistingFiles: [],
        deletedFilePaths: [
          RepositoryRelativePath.create('old.json'),
        ],
        removedByApply: [],
        writtenFilePaths: [
          RepositoryRelativePath.create('biome.json'),
          RepositoryRelativePath.create('constitution.lock'),
        ],
        writtenUnitPaths: [
          UnitPath.create(''),
        ],
      },
    });
  });
});
