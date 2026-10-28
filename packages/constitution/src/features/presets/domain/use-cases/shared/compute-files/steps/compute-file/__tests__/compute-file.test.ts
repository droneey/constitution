import { describe, expect, it } from 'bun:test';

import type { FileRead } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

import { createFakeConfigurationFormat } from '../../../../../../../__tests__/configuration-format.fake';
import type { LockRecord, MergedFile } from '../../../../../../entities';
import { Lock, PresetsCode, RecordKind, WholeKind } from '../../../../../../entities';
import type { ComputeFileInput } from '../compute-file';
import { computeFile, FileChangeKind } from '../compute-file';

const inputOf = (input: {
  filePath: string;
  merged: MergedFile;
  read: FileRead;
  record: LockRecord;
}): ComputeFileInput => ({
  blockIds: [],
  filePath: RepositoryRelativePath.create(input.filePath),
  formats: createFakeConfigurationFormat(),
  plan: {
    entries: [],
    filePath: RepositoryRelativePath.create(input.filePath),
    merged: input.merged,
    unitPath: UnitPath.create(''),
  },
  read: input.read,
  record: input.record,
});

describe('computeFile', () => {
  it('should find a file it cannot read, and leave the file and its record as they are', () => {
    // Arrange
    const record: LockRecord = {
      addresses: [],
      defaults: [],
      isCreated: false,
      kind: RecordKind.Settings,
      leaves: [
        'kept',
      ],
    };

    // Act
    const computed = computeFile(
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
    expect({
      change: computed.change,
      findings: computed.findings.map(({ code }) => code),
    }).toStrictEqual({
      change: {
        kind: FileChangeKind.Kept,
        record,
      },
      findings: [
        PresetsCode.FileUnparsed,
      ],
    });
  });

  it('should leave a file that is there as it is where its default is a whole text', () => {
    // Act
    const computed = computeFile(
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
    expect(computed.change).toStrictEqual({
      kind: FileChangeKind.Kept,
      record: Lock.wholeRecord,
    });
  });

  it('should write a file of no format whose whole default gives keys in the shape of keys', () => {
    // Act
    const computed = computeFile(
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
    expect(computed.change).toStrictEqual({
      kind: FileChangeKind.Written,
      record: expect.any(Object),
      text: 'registry=x\n',
    });
  });
});
