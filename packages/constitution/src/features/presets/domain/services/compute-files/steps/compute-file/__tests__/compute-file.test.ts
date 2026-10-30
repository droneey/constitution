import { describe, expect, it } from 'bun:test';

import type { FileRead } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import type {
  FileChange,
  FileComputed,
  LockRecord,
  MergedFile,
  PresetsFinding,
} from '../../../../../entities';
import {
  FileChangeKind,
  Lock,
  PresetsCode,
  RecordKind,
  SettingShape,
  WholeKind,
} from '../../../../../entities';
import type { ComputeFileInput, FilePending } from '../compute-file';
import { beginFile, FileStepKind, finishFile, settleFile } from '../compute-file';

const inputOf = (input: {
  filePath: string;
  merged: MergedFile;
  read: FileRead;
  record: LockRecord;
}): ComputeFileInput => ({
  blockIds: [],
  filePath: RepositoryRelativePath.create(input.filePath),
  plan: {
    entries: [],
    filePath: RepositoryRelativePath.create(input.filePath),
    merged: input.merged,
    unitPath: UnitPath.create(''),
  },
  read: input.read,
  record: input.record,
});

const reportsOf = (input: {
  change: FileChange;
  filePath: string;
  findings?: readonly PresetsFinding[];
}): FileComputed => ({
  change: input.change,
  defaultsAddedToExistingFile: [],
  filePath: RepositoryRelativePath.create(input.filePath),
  findings: input.findings ?? [],
  missingOrOutdated: [],
  removedByApply: [],
  staleWithoutReplacement: [],
  unsorted: [],
});

const unparsedAt = (filePath: string): readonly PresetsFinding[] => [
  {
    code: PresetsCode.FileUnparsed,
    details: {},
    path: RepositoryRelativePath.create(filePath),
  },
];

const pendingOf = (read: FileRead): FilePending => ({
  defaultsAddedToExistingFile: [],
  filePath: RepositoryRelativePath.create('biome.json'),
  findings: [],
  isDeleted: false,
  missingOrOutdated: [],
  read,
  record: Lock.emptyRecord,
  removedByApply: [],
  setting: {
    width: 100,
  },
  staleWithoutReplacement: [],
  unsorted: [],
});

describe('beginFile', () => {
  it('should find a file it cannot read, and leave the file and its record as they are', () => {
    // Arrange
    const record: LockRecord = {
      addresses: [],
      everMetDefaults: [],
      isCreatedByApply: false,
      kind: RecordKind.Settings,
      leaves: [
        'kept',
      ],
    };

    // Act
    const begun = beginFile(
      inputOf({
        filePath: 'biome.json',
        merged: {
          defaults: [],
          problems: [],
          value: {
            width: 100,
          },
        },
        read: {
          cause: new Error('permission denied'),
          status: FileReadStatus.Unreadable,
        },
        record,
      }),
    );

    // Assert
    expect(begun).toStrictEqual({
      computed: reportsOf({
        change: {
          kind: FileChangeKind.Kept,
          record,
        },
        filePath: 'biome.json',
        findings: unparsedAt('biome.json'),
      }),
      kind: FileStepKind.Computed,
    });
  });

  it('should leave a file that is there as it is where its default is a whole text', () => {
    // Act
    const begun = beginFile(
      inputOf({
        filePath: 'src/sandbox.py',
        merged: {
          defaults: [],
          problems: [],
          whole: {
            kind: WholeKind.Text,
            text: 'pass\n',
          },
        },
        read: {
          status: FileReadStatus.Read,
          text: 'mine\n',
        },
        record: Lock.emptyRecord,
      }),
    );

    // Assert
    expect(begun).toStrictEqual({
      computed: reportsOf({
        change: {
          kind: FileChangeKind.Kept,
          record: Lock.wholeRecord,
        },
        filePath: 'src/sandbox.py',
      }),
      kind: FileStepKind.Computed,
    });
  });

  it('should read a file of no format whose whole default gives keys in the shape of keys', () => {
    // Act
    const begun = beginFile(
      inputOf({
        filePath: '.npmrc',
        merged: {
          defaults: [],
          problems: [],
          whole: {
            kind: WholeKind.Added,
            setting: {
              registry: 'x',
            },
          },
        },
        read: {
          status: FileReadStatus.Missing,
        },
        record: Lock.emptyRecord,
      }),
    );

    // Assert
    expect(begun).toStrictEqual({
      file: {
        filePath: RepositoryRelativePath.create('.npmrc'),
        shape: SettingShape.Map,
        text: '',
      },
      kind: FileStepKind.Parse,
    });
  });
});

describe('settleFile', () => {
  it('should find a file whose text its format cannot parse', () => {
    // Arrange
    const input = inputOf({
      filePath: 'biome.json',
      merged: {
        defaults: [],
        problems: [],
        value: {
          width: 100,
        },
      },
      read: {
        status: FileReadStatus.Read,
        text: '{',
      },
      record: Lock.emptyRecord,
    });

    // Act
    const settled = settleFile({
      ...input,
      file: {
        filePath: input.filePath,
        text: '{',
      },
      parsed: undefined,
    });

    // Assert
    expect(settled).toStrictEqual({
      computed: reportsOf({
        change: {
          kind: FileChangeKind.Kept,
          record: Lock.emptyRecord,
        },
        filePath: 'biome.json',
        findings: unparsedAt('biome.json'),
      }),
      kind: FileStepKind.Computed,
    });
  });
});

describe('finishFile', () => {
  it('should keep a file whose written text is the text it holds', () => {
    // Act
    const computed = finishFile(
      pendingOf({
        status: FileReadStatus.Read,
        text: 'same\n',
      }),
      'same\n',
    );

    // Assert
    expect(computed.change).toStrictEqual({
      kind: FileChangeKind.Kept,
      record: Lock.emptyRecord,
    });
  });

  it('should write a file whose written text differs from the text it holds', () => {
    // Act
    const computed = finishFile(
      pendingOf({
        status: FileReadStatus.Read,
        text: 'before\n',
      }),
      'after\n',
    );

    // Assert
    expect(computed.change).toStrictEqual({
      kind: FileChangeKind.Written,
      record: Lock.emptyRecord,
      text: 'after\n',
    });
  });
});
