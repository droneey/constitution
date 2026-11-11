import { describe, expect, it } from 'bun:test';

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
      format: undefined,
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
      format: FileFormat.Text,
      heldBefore: new Set(Leaf.leavesOf(COPIED_TEXT).map(Leaf.keyOf)),
      isCreatedByApply: true,
      lock: Lock.emptyRecord,
      ours: COPIED_TEXT,
    });

    // Assert
    expect('format' in record).toBe(false);
  });
});
