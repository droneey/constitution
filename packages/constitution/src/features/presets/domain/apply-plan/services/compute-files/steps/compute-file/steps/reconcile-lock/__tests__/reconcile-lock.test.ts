import { describe, expect, it } from 'bun:test';

import { RepositoryRelativePath } from '#/kernel/value-objects';

import { Lock } from '../../../../../../../../lock/entities';
import { Leaf } from '../../../../../../../../setting/entities';
import { FileFormat } from '../../../../../../../../shared/value-objects';
import { recordOf } from '../reconcile-lock';

const COPIED_TEXT = 'rule: no-data\n';

describe('recordOf', () => {
  it('should keep no address field when the file held every leaf of ours first', () => {
    // Arrange
    const ours = {
      'rules[name=size]': {
        level: 'error',
      },
    };

    // Act
    const record = recordOf({
      everMetDefaults: [],
      fields: [
        'name',
      ],
      file: {
        filePath: RepositoryRelativePath.create('biome.json'),
        text: '',
      },
      heldBefore: new Set(Leaf.leavesOf(ours).map(Leaf.keyOf)),
      isCreatedByApply: false,
      lock: Lock.emptyRecord,
      ours,
    });

    // Assert
    expect(record.addresses).toStrictEqual([]);
  });

  it('should keep no format when the file held the text first though it is marked as text', () => {
    // Act
    const record = recordOf({
      everMetDefaults: [],
      fields: [],
      file: {
        filePath: RepositoryRelativePath.create('rules/no-data.yml'),
        format: FileFormat.Text,
        text: COPIED_TEXT,
      },
      heldBefore: new Set(Leaf.leavesOf(COPIED_TEXT).map(Leaf.keyOf)),
      isCreatedByApply: true,
      lock: Lock.emptyRecord,
      ours: COPIED_TEXT,
    });

    // Assert
    expect('format' in record).toBe(false);
  });
});
